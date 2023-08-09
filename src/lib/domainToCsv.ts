// @ts-nocheck
// ToDo: Remove the above ts-nocheck flag. Need to migrate this JS code to TS.
export const csvMaker = (domain) => {
	let csvRows = [];
	const headers = ['cardname', 'cardq', 'cardrarity', 'cardcondition', 'card_edition', 'cardset', 'cardcode', 'cardid'];
	csvRows.push(headers.join(','));
	for (const row of domain.data) {
		const values = headers.map((header) => row[header]);
		csvRows.push(values.join(','));
	}
	return csvRows.join('\n');
}

const setup = async function (url: string, domain) {
	const res = await fetch(url);
	const json = await res.json();
	return json;
}

const bulkdomain = async function (url,domain) {
	let toAdd = { data: [] };
	const json = await setup(url);
	for (var curcard of json.data){
		if (!domain.data.includes(curcard)) {
			toAdd.data.push(curcard);
		}
	}
	return toAdd;
}

const chkcards = async function (cards,domain,deck_master) {
	var toadd = {
		"data":[]
	}
	//check monsters for the domain
	var pushed = false
	for (var curcard of cards.data){
		// check if card is already listed
		if (!domain.data.includes(curcard)) {
			// check if card is directly named
			if (deck_master.cards.includes(curcard.name)){
				toadd.data.push(curcard);
			} else {
				// check for stats
				if (deck_master.stats != []) {
					for (const stat of deck_master.stats) {
						if (curcard.atk.toString() == stat.match("[0-9]{1,4} ATK")[0].match("[0-9]{1,4}")[0] && curcard.def.toString() == stat.match("[0-9]{1,4} DEF")[0].match("[0-9]{1,4}")[0]) {
							toadd.data.push(curcard);
							pushed = true;
						}
					}
				}
				if (!pushed) {
					// check for archs
					for (const arch of deck_master.archetypes) {
						try {
							var curtext = curcard.desc.match('\(This card is( also)? always treated as an? ".*\)')[0]
							if ((curtext.includes('"'+arch+'"') || curcard.name.includes(arch)) && curcard.desc.match('not treated as an? "'+arch+'"') == null) {
								console.log("cardname: "+curcard.name)
								toadd.data.push(curcard);
								break;
							}
						} catch {
							if (curcard.name.includes(arch) && curcard.desc.match('not treated as an? "'+arch+'"') == null) {
								console.log("cardname: "+curcard.name)
								toadd.data.push(curcard);
								break;
							}
						}
					}
				}
			}
		}
	}
	return toadd;
}

const execute = async function (deck_master, spelltraps) {
	//___________________________________________________________________________________________________________DOMAIN FINDER 
	//init vars
	var domain = {
		"data":[]
	}
	const apiurl = "https://db.ygoprodeck.com/api/v7/cardinfo.php";
	var res

	// add all spell/traps to domain
	if (spelltraps) {
		const urlspells = apiurl + "?type=Spell%20Card";
		res = await bulkdomain(urlspells,domain)
		await domain.data.push.apply(domain.data,res.data);
		const urltraps = apiurl + "?type=Trap%20Card";
		res = await bulkdomain(urltraps,domain)
		await domain.data.push.apply(domain.data,res.data);
	}
  
  //add divine monsters to list to add
  if (!deck_master.attributes.includes("DIVINE")) { deck_master.attributes.push("DIVINE") }
  
	// add attributes and types to domain
	for (const curattribute of deck_master.attributes){
		var urlattribute = apiurl + "?attribute=" + curattribute;
		res = await bulkdomain(urlattribute,domain)
		await domain.data.push.apply(domain.data,res.data);
	}
	for (const curtype of deck_master.types){
		var urltype = apiurl + "?race=" + curtype;
		res = await bulkdomain(urltype,domain)
		await domain.data.push.apply(domain.data,res.data);
	}

	// list monsters
	const urlmonstereffect = apiurl + "?type=effect%20monster";
	res = await setup(urlmonstereffect,domain);
	res = await chkcards(res,domain,deck_master)
	await domain.data.push.apply(domain.data,res.data);
	const urlmonsternormal = apiurl + "?type=normal%20monster";
	res = await setup(urlmonsternormal,domain);
	res = await chkcards(res,domain,deck_master)
	await domain.data.push.apply(domain.data,res.data);
	
	return domain;
}

export default execute;
