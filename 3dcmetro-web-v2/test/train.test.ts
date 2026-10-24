import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTrainLocationData } from '../src/train';

const mockFetch = vi.fn();

global.fetch = mockFetch;

describe('getTrainLocationData', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  const text = JSON.stringify({
    "displayFieldName": "TRACKNAME",
    "fieldAliases": {
      "ITT": "ITT",
    },
    "geometryType": "esriGeometryPoint",
    "spatialReference": {
      "wkid": 102100,
      "latestWkid": 3857
    },
    "fields": [
      {
        "name": "ITT",
        "type": "esriFieldTypeString",
        "alias": "ITT",
        "length": 3
      },
    ],
    "features": [
      {
        "attributes": {
          "ITT": "19",
        },
        "geometry": {
          "x": -8572889.0915490165,
          "y": 4706610.8976550205
        }
      }
    ],
  });
  it('gets train location data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(text),
    });
    await getTrainLocationData();
  });
});