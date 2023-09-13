import { OSM_API_URL } from '../utils/constants.js';
import { ChangetsetStatus } from '../models/enums.js';
import { Coordinates } from '../models/coordinates.js';
import { MappingChangeset } from '../models/mapping-changeset.js';
import { UserChangesets } from '../models/user-changesets.js';

export async function fetchUserChangesets(username) {
  const userChangesets = new UserChangesets(username);
  const changesetsQueryURL = `${OSM_API_URL}/changesets?display_name=${username}`;
  const response = await fetch(changesetsQueryURL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  try {
    const responseJSON = await response.json();

    userChangesets.deleteAll();

    for (const changeset of responseJSON.changesets) {
      const coordinates = await fetchChangesetCoordinates(changeset.id);
      const amenities = await fetchChangesetValuesByKey(
        changeset.id,
        'amenity'
      );
      const mappingChangeset = new MappingChangeset(
        changeset.id,
        (await ethutils.isChangesetMinted(changeset.id))
          ? ChangetsetStatus.Minted
          : ChangetsetStatus.New,
        coordinates.minCoordinates,
        coordinates.maxCoordinates,
        amenities
      );

      userChangesets.insert(mappingChangeset);
    }

    return userChangesets;
  } catch (error) {
    console.log(`erro ao consultar changesets: ${error}`);
  }
}

async function fetchChangesetValuesByKey(changesetId, key) {
  const changesetQueryURL = `${OSM_API_URL}/changeset/${changesetId}/download`;
  const response = await fetch(changesetQueryURL, {
    method: 'GET',
    headers: {
      Accept: 'application/xml',
    },
  });

  try {
    const responseText = await response.text();
    const regexValues = new RegExp(`(?<=(k="${key}" v=")).+(?=("))`, 'gm');
    const result = new Set();

    for (const value of responseText.matchAll(regexValues)) {
      result.add(value[0]);
    }

    return result;
  } catch (error) {
    console.log(`erro ao consultar valores para chave '${key}': ${error}`);
  }
}

async function fetchChangesetCoordinates(changesetId) {
  const changesetQueryURL = `${OSM_API_URL}/changeset/${changesetId}.json`;
  const response = await fetch(changesetQueryURL, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  try {
    const responseJSON = await response.json();

    if (responseJSON.elements.length > 0) {
      const minCoordinates = new Coordinates(
        responseJSON.elements[0].minlat,
        responseJSON.elements[0].minlon
      );
      const maxCoordinates = new Coordinates(
        responseJSON.elements[0].maxlat,
        responseJSON.elements[0].maxlon
      );

      return { minCoordinates, maxCoordinates };
    }
  } catch (error) {
    console.log(`erro ao consultar coordenadas: ${error}`);
  }
}
