// A representation of a card entry in the sheet, contain all the information within it.
// Used to unify the information retrieved from multiple sources (like from the sheet itself or YGOPRODECK).
const CardEntry = class CardEntry 
{
  // Base empty constructor.
  constructor()
  {
    this.name = null;
    this.type = null;
    this.subType = null;
    this.attribute = null;
    this.level = null;
    this.scale = null;
    this.linkR = null;
    this.atk = null;
    this.def = null;
    this.id = null;
    this.imageUrl = null;
    this.original = null;
    this.domain = null;
    this.notes = null;											
  }

  // Generates a new CardEntry object using a spreadsheet line as reference.
  static FromSheet(info)
  {
    var entry = new CardEntry();
    entry.name = info[0];
    entry.type = info[1];
    entry.subType = info[2];
    entry.attribute = info[3];
    entry.level = info[4];
    entry.scale = info[5];
    entry.linkR = info[6];
    entry.atk = info[7];
    entry.def = info[8];
    entry.id = info[9];
    entry.imageUrl = info[10];
    entry.original = info[11];
    entry.domain = info[12];
    entry.notes = info[13];
    return entry;
  }

  // Generates a new CardEntry object using a YGOPRODECK data as reference.
  static FromYGOPRODECK(data)
  {
    var entry = new CardEntry();
    entry.name = data['name'];
    entry.type = data['type'];
    entry.subType = data['race'];
    entry.attribute = data['attribute'] || '';
    entry.level = data['level'] || '';
    entry.scale = data['scale'] || '';
    entry.linkR = data['linkval'] || '';
    entry.atk = data['atk'] || '';
    entry.def = data['def'] || '';
    entry.id = data['id'];
    entry.imageUrl = Utilities.formatString("https://images.ygoprodeck.com/images/cards/%s.jpg", entry.id); // YGOPRODECK does provide links from the arts in the data, but it's separated between the sets (due to alt arts). So it's easier to just do it this way.
    entry.original = data['desc'];
    entry.domain = data['desc'];
    entry.notes = '';
    return entry;
  }

  // Creates an array containing the values of this entry
  Values()
  {
    return [
      this.name,
      this.type,
      this.subType,
      this.attribute,
      this.level,
      this.scale,
      this.linkR,
      this.atk,
      this.def,
      this.id,
      this.imageUrl,
      this.original,
      this.domain,
      this.notes,	
    ]
  }

  // Returns a JSON with the ID and domain description
  DomainDescJSON()
  {
    let json = new Object();
    json.id = this.id;
    json.desc = this.domain;
    return json;
  }

  // Compares two CardEntries, ordering by name
  static CompareNames(a, b) {
    if(a.name < b.name)
    {
      return -1;
    }
    else if(a.name > b.name)
    {
      return 1;
    }
    else
    {
      return 0;
    }
  }
}