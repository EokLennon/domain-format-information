// The sheet contain the card list
const CARDS_SHEET = 'Cards';
// The sheet contain the configuration
const CONFIG_SHEET = 'Configuration';

// The column where the original text is at.
const ORIGINAL_TEXT_COLUMN = 11;
// The column where the domain text is at.
const DOMAIN_TEXT_COLUMN = 12;

// The YGOPRO Url to retrieve the cards from
const YGOPRODECK_URL_GET_CARDS = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?&startdate=%s&enddate=%s';

// The light green BG color.
const LIGHT_GREEN = '#e2efda';
// The dark green border color.
const DARK_GREEN = '#70ad47';
// The white BG color.
const WHITE = 'white';

// Called when the spreadsheet is open
function onOpen() {
  // Creates a new "Domain" menu
  let ui = SpreadsheetApp.getUi();
  ui.createMenu('Domain')
      .addItem('Retrieve Cards', 'UpdateCardsSheet')
      .addItem('Update Layout', 'UpdateLayout')
      .addItem('Download Descriptions JSON', 'GenerateDomainDescJSON')
      .addToUi();
}

// Helper function to unify how we retrieve the values from the cards sheet
function GetSheetCards()
{
  // Getting cards sheet values
  let cardsSheet = SpreadsheetApp.getActive().getSheetByName(CARDS_SHEET);
  if(cardsSheet == null)
  {
    return Error('Could not find sheet with the name ' + CARDS_SHEET);
  }
  let cardsData = cardsSheet.getRange('A2:N').getValues(); // Start from the second line to prevent getting the header
  
  return cardsData;
}

// Retrieves cards from YGOPRODECK and add them to the spreadsheet
function UpdateCardsSheet()
{
  // Getting config sheet data
  let configSheet = SpreadsheetApp.getActive().getSheetByName(CONFIG_SHEET);
  if(configSheet == null)
  {
    return Error('Could not find sheet with the name ' + CONFIG_SHEET);
  }

  // Getting config values
  let configData = configSheet.getRange('A1:A').getValues(); // Config data should be the first column
  let endDate = configSheet.getRange(1, 2).getValue(); // EndDate should be in B1 (1, 2)

  // Fetching the cards from YGOPRODECK
  let startRelease = Utilities.formatDate(new Date(configData.shift()), 'GMT', 'MM/dd/yyyy');
  let endRelease = Utilities.formatDate(endDate === '' ? new Date() : endDate, 'GMT', 'MM/dd/yyyy'); // if endDate is empty, use the current date instead

  let res;
  try
  {
    let fetchURL = Utilities.formatString(YGOPRODECK_URL_GET_CARDS, startRelease, endRelease);
    res = UrlFetchApp.fetch(fetchURL);
  }
  catch(e)
  {
    return "Error while trying to retrieve cards: " + e;
  }
  let resData = JSON.parse(res.getContentText())['data']; // YGOPRODECK response comes inside a big 'data' object

  // Getting cards sheet values
  let cardsData;
  try
  {
    cardsData = this.GetSheetCards();
  }
  catch(e)
  {
    return e;
  }

  // Creating set of ids that already exist in the sheet.
  let idSet = new Set();
  configData.forEach(line => (idSet.add(line[0]))); // Add the cards in the config sheet

  let cardEntries = []; // List of cards that will be in the sheet.
  cardsData.forEach(line => 
  {
    let entry = CardEntry.FromSheet(line);
    idSet.add(entry.id); // Add the cards in the cards sheet.
    cardEntries.push(entry); // The cards in the sheet should remain there.
  });

  // Adding non-duplicate cards from YGOPRO's response to Cards Entries
  resData.forEach(cardData => 
  {
    if(!(idSet.has(cardData['id']))) // Add a cards only if it's in neither sheets
    {
      let entry = CardEntry.FromYGOPRODECK(cardData);
      idSet.add(entry.id);
      cardEntries.push(entry);
    }
  });

  // Updating sheet config
  let configValues = [[endRelease]];
  idSet.forEach(id => configValues.push([id])); // Google sheets need an matrix, so we are making [[date], [id], [id]...]
  configSheet.getRange('A1:A' + configValues.length).setValues(configValues);

  // Updating cards sheet entries
  let cardValues = [];
  cardEntries.sort(CardEntry.CompareNames); // Orders the list alphabetically
  cardEntries.forEach(entry => cardValues.push(entry.Values())); // Returns the values in an array
  SpreadsheetApp.getActive().getSheetByName(CARDS_SHEET).getRange('A2:N'+(cardValues.length + 1)).setValues(cardValues); // length + 1 since we start from the second line

  // Updating Layout
  this.UpdateLayout();
}

function UpdateLayout()
{
  // Gets the range of all the cards currently in the list
  let cardsSheet = SpreadsheetApp.getActive().getSheetByName(CARDS_SHEET);
  let cardsRange = cardsSheet.getRange('A2:N'); // A2 to ignore the header.

  let backgrounds = cardsRange.getBackgrounds(); // Getting the background just so we don't have to make the array ourselves.

  // Set the background colors
  for(let i = 0; i < backgrounds.length; i++)
  {
    let color = ((i % 2) === 0) ? WHITE : LIGHT_GREEN; // Alternates between white and green.

    for(let j = 0; j < backgrounds[i].length; j++)
    {
      backgrounds[i][j] = color;
    }
  }

  cardsRange.setBorder(false, false, false, false, false, true, DARK_GREEN, null); // Sets the border between each line
  cardsRange.setBackgrounds(backgrounds);
}

function GenerateDomainDescJSON()
{
  // Getting the cards sheet data
  let cardsData;
  try
  {
    cardsData = this.GetSheetCards();
  }
  catch(e)
  {
    return e;
  }

  // Generating the JSON
  let info = [];
  cardsData.forEach(line => 
  {
    let cardEntry = CardEntry.FromSheet(line);
    info.push(cardEntry.DomainDescJSON());
  });

  // 'Downloading' (just creating a new file in the gdrive)
  let currDate = Utilities.formatDate(new Date(), 'GMT', 'MM/dd/yyyy');
  DriveApp.getRootFolder().createFile('DomainDesc'+currDate+'.json', JSON.stringify(info));
}