import { OSM_API_URL, OVERPASS_API } from '../utils/constants.js';
import { ChangetsetStatus } from '../models/enums.js';
import { Coordinates } from '../models/coordinates.js';
import { MappingChangeset } from '../models/mapping-changeset.js';
import { UserChangesets } from '../models/user-changesets.js';

export async function fetchUserChangesets(username, projects) {
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
      const nodes = await fetchChangesetNodes(changeset.id);
      const acceptedProjects = listAcceptedProjects(nodes, projects);

      if (acceptedProjects.length > 0) {
        const mappingChangeset = new MappingChangeset(
          changeset.id,
          (await ethutils.isChangesetMinted(changeset.id))
            ? ChangetsetStatus.Minted
            : ChangetsetStatus.New,
          await fetchChangesetNodes(changeset.id),
          acceptedProjects
        );

        console.log(mappingChangeset);

        userChangesets.insert(mappingChangeset);
      }
    }

    return userChangesets;
  } catch (error) {
    console.log(`erro ao consultar changesets: ${error}`);
  }
}

function listAcceptedProjects(nodes, projects) {
  const result = new Array();

  for (const project of projects.getAll()) {
    if (nodes.every((node) => project.validNodes.includes(node))) {
      result.push(project);
    }
  }

  return result;
}

async function fetchChangesetNodes(changesetId) {
  const changesetQueryURL = `${OSM_API_URL}/changeset/${changesetId}/download`;
  const response = await fetch(changesetQueryURL, {
    method: 'GET',
    headers: {
      Accept: 'application/xml',
    },
  });

  try {
    const responseText = await response.text();
    const regexValues = /(?<=(nd ref="|node id="))\d+(?=("))/gm;
    const result = new Array();

    for (const value of responseText.matchAll(regexValues)) {
      result.push(parseInt(value[0]));
    }

    return result;
  } catch (error) {
    console.log(`erro ao consultar valores para chave '${key}': ${error}`);
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
    const regexValues = /(?<=(k="${key}" v=")).+(?=("))/gm;
    const result = new Array();

    for (const value of responseText.matchAll(regexValues)) {
      result.push(value[0]);
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

export async function fetchAreaNodes(areaType, areaId) {
  const result = new Array();
  const response = await fetch(
    `${OSM_API_URL}/${areaType}/${areaId}/full.json`,
    {
      method: 'GET',
    }
  );

  if (response.ok) {
    const responseJSON = await response.json();

    for (const elements of responseJSON.elements) {
      if (elements.type === 'node') {
        const coordinates = new Coordinates(elements.lat, elements.lon);
        result.push(coordinates);
      }
    }
  }

  return result;
}

export async function fetchValidNodes(areaType, areaId, validKeys) {
  const result = new Array();
  const response = await fetch(OVERPASS_API, {
    method: 'POST',
    body: buildOverpassValidNodesQuery(areaType, areaId, validKeys),
  });

  if (response.ok) {
    const responseJSON = await response.json();

    for (const element of responseJSON.elements) {
      if (element.type === 'node') {
        result.push(element.id);
      }
    }
  }

  return result;
}

function buildOverpassValidNodesQuery(areaType, areaId, validKeys) {
  let validKeysQuery = '';

  for (const [key, values] of Object.entries(validKeys)) {
    for (const value of values) {
      validKeysQuery += `["${key}"="${value}"]`;
    }
  }

  return `[out:json][timeout:25];${areaType}(id:${areaId});map_to_area;node(area)${validKeysQuery};out skel;`;
}
