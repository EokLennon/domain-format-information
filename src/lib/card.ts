import Card, { CardDomain } from '../models/card';
import { validArchetypes } from './constants';

// #region Regex Replacers
const cleanNotTreatedAsClause = (str: string) => {
  const regex = /\(This card is not treated as an? ".*" card.\)/i;
  const clauses: string[] = [];
  const cleanedStr = str.replace(regex, (match) => {
    clauses.push(match);
    return '';
  });
  
  return ({ clauses, cleanedStr });
}
const cleanMentionedArchetypes = (str: string, name: string) => {
  const regex = /"(.*?)"/g;
  const _matches: string[] = [];
  const archetypes: string[] = [];
  const cards: string[] = [];
  const cleanedStr = str.replace(regex, (match: string) => {
    const m = match.replaceAll('"', ''); // Cleanup " in match
    _matches.push(m); // Save match in array
    return '';
  });
  
  // Remove duplicates, cardname mentions and invalid archetypes.
  _matches.forEach((v, i, array) => {
    if (array.indexOf(v) !== i) return;

    if (validArchetypes.indexOf(v) > -1) {
      archetypes.push(v);
      return;
    }

    if (v !== name) {
      cards.push(v);
      return;
    }
  });
  
  return ({ archetypes, cards, cleanedStr });
}
const cleanMentionedTokens = (str: string) => {
  const regex = /\(.*\)/g;
  const tokens: string[] = [];
  const cleanedStr = str.replace(regex, (match) => {
    tokens.push(match);
    return '';
  });
  
  return ({ tokens, cleanedStr });
}
const cleanMentionedBattleStats = (str: string) => {
  const regex = /[0-9]{1,4} ATK\/[0-9]{1,4} DEF|ATK [0-9]{1,4}\/DEF [0-9]{1,4}|[0-9]{1,4} ATK and [0-9]{1,4} DEF/gi;
  const stats: string[] = [];
  const cleanedStr = str.replace(regex, (match: string) => {
    const m = match.replaceAll(' and ', '/');
    stats.push(m);
    return '';
  });
  
  return ({ stats, cleanedStr });
}
const cleanMentionedTypes = (str: string, type: string) => {
  const regex = /(Aqua|Beast-Warrior|Beast|Cyberse|Dinosaur|Divine-Beast|Dragon|Fairy|Fiend|Fish|Insect|Machine|Plant|Psychic|Pyro|Reptile|Rock|Sea Serpent|Spellcaster|Thunder|Warrior|Winged Beast|Wyrm|Zombie)/g
  const _types: string[] = [type];
  const cleanedStr = str.replace(regex, (match) => {
    _types.push(match);
    return '';
  });

  const types = _types.filter((v, i, array) => array.indexOf(v) === i);
  
  return ({ types, cleanedStr });
}
const cleanMentionedAttributes = (str: string, attribute: string) => {
  const regex = /(DARK|DIVINE|EARTH|FIRE|LIGHT|WATER|WIND|LAUGH)/g
  const _attributes: string[] = [attribute];
  const cleanedStr = str.replace(regex, (match) => {
    _attributes.push(match);
    return '';
  });

  const attributes = _attributes.filter((v, i, array) => array.indexOf(v) === i);
  
  return ({ attributes, cleanedStr });
}
// #endregion

export const getCardDomain = (card: Card): Omit<CardDomain, 'name' | 'desc'> => {
  const effect = card.desc;
  const name = card.name;
  const type = card.race;
  const attribute = card.attribute ?? '';
  const frame = card.frameType;
  
  let cardText = effect;
  // Step One (Not treated as clause)
  const { cleanedStr: cleanedStr1 } = cleanNotTreatedAsClause(cardText);
  cardText = cleanedStr1;
  // Step Two (Mentioned Cards and Archetypes)
  const { archetypes, cards, cleanedStr: cleanedStr2 } = cleanMentionedArchetypes(cardText, name);
  cardText = frame === 'normal' ? '' : cleanedStr2;
  // Step Three (Token text)
  const { cleanedStr: cleanedStr3 } = cleanMentionedTokens(cardText);
  cardText = cleanedStr3;
  // Step Four (Mentioned ATK/DEF)
  const { stats, cleanedStr: cleanedStr4 } = cleanMentionedBattleStats(cardText);
  cardText = cleanedStr4;
  // Step Five (Mentioned Types)
  const { types, cleanedStr: cleanedStr5 } = cleanMentionedTypes(cardText, type);
  cardText = cleanedStr5;
  // Step Six (Mentioned Attributes)
  const { attributes, cleanedStr: cleanedStr6 } = cleanMentionedAttributes(cardText, attribute);
  cardText = cleanedStr6;

  return { archetypes, cards, stats, types, attributes };
}

export const getOriginalInformation = async (id: string): Promise<Card | undefined> => {
  try {
    const petition = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`);
    const response = await petition.json();
    return response.data?.[0];
  } catch (err) {
    console.log(err);
    return;
  }
}

// ToDo: Implement Google Sheets API to get Domain Text and Archetypes from DK sheet.
export const getDomainAdditionalInformation = async (card: Card): Promise<{ archetypes: string[], desc: string } | undefined> => {
  try {
    // const petition = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?id=${id}`);
    // const response = await petition.json();
    return { archetypes: [], desc: 'ToDo: Add Domain effect text from endpoint/json/csv.' }
  } catch (err) {
    console.log(err);
    return;
  }
}

export const getDomainInformation = async (card: Card | undefined): Promise<CardDomain | undefined> => {
  if (!card) return;
  if (['spell', 'trap', 'token', 'skill'].indexOf(card.frameType) > -1) return;
  const _domain = getCardDomain(card);
  const addon = await getDomainAdditionalInformation(card);
  const archetypes: string[] = [..._domain.archetypes, ...(addon?.archetypes || [])].filter((v, i, array) => !!v && array.indexOf(v) === i);
  const domain: CardDomain = {
    ..._domain,
    archetypes,
    name: card.name,
    desc: addon?.desc || ''
  }
  return domain;
}
