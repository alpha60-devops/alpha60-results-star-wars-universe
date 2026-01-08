# Documentation for the alpha60 JSON files

## shared data fields
- collection-key
- data-version
- geolocation-version

## cumulative duration data
- south-park-2701-cumulative.json
  - collection-cumulative
    - btiha
    - unique-btiha
  - data-transfer
  - geo-whole-earth-resolution-partitions
  - geo-slices-4-cahill-keyes-quadrant-peers
  - geo-slices-continental-peers
  - geo-country-top-10-peers
  - geo-country-top-10-seeds
  - geo-country-region-city-top-30-peers

- south-park-2701-cumulative-ip-swarm.json
  - swarm-analysis
    - anomalies_and_tor_exit_nodes
    - carrier_and_mobile_wireless
    - satellite
    - privacy
      - global
      - by_country

- south-park-2701_cumulative-media-objects-itemized.json
  - collection_btiha_duplicates
  - collection_btiha_itemized // collection-cumulative-itemized
  - collection_media_objects_itemized

## week duration data
- south-park-2701-week.json
  - collection-week
    - 0-n

- south-park-2701-week-00001-btiha-itemized.json
- south-park-2701-week-00002-btiha-itemized.json
- south-park-2701-week-00003-btiha-itemized.json
- south-park-2701-week-00004-btiha-itemized.json
- south-park-2701-week-00005-btiha-itemized.json
- south-park-2701-week-00006-btiha-itemized.json
- south-park-2701-week-00007-btiha-itemized.json
  - collection-week-7
  - collection-week-7-itemized
    - [ 0 - btiha.size() ]
      - name, btih, creation, peer, seed


```
{
// Version number for data migration and feature checks
    "data_version": "20191004",

// Date range of the sample duration
    "duration": "2017-10-27-to-2017-12-31",

// Media object name
    "collection_name": "Stranger Things",
```