---
layout: default
---

{::nomarkdown}
<img src="../resources/a60-logo-block-gray.simple.svg?sanitize=true" height="50" width="100">
{:/}

<div style="height: 50px;"></div>


# Andor Seasons 1 and 2

## Results
<div style="height: 50px;"></div>

### Graphs

<script type="text/javascript" crossorigin="anonymous" id="graph-hover"
	src="../resources/izzi-graph-hover-txt-polyline-red.js">
</script>

{::nomarkdown}
{% include andor-downloads-by-week-cumulative-normalized-start.svg %}
{:/}
<div style="height: 50px;"></div>


### Maps

<script type="text/javascript" crossorigin="anonymous" id="geojson-map"
	src="../resources/izzi-map-leaflet-geojson-v7.2.js">
</script>

{% include andor-s1s2-carto-table.html %}
<div style="height: 50px;"></div>


### Tables

<script type="text/javascript" crossorigin="anonymous" id="table-sort"
	src="../resources/izzi-script-table-sort-inline.js">
</script>

{% include andor-meta-collection-table.html %}
<div style="height: 50px;"></div>

{% include andor-media-objects-table.html %}
<div style="height: 50px;"></div>


## Commentary, Questions

### Season one
  - Season two last episodes swarm < first episodes swarm.
  - In the context of 2022 (as immediate past COVID-19 lockdown), similar results to contemporaneous shows like Obiwan Kenobi, Book of Bobba Fett.

### Season two
  - Season two opener 4x higher swarm count than Season one opener.
  - Season two last episodes swarm > first episodes swarm.

### What percentage of viewers are from the USA?

#### Synthetic week Only results
Nielsen methodology uses 35 day measurements of select USA-only data feeds. Approximate this by using 5 week USA only swarm results. How does this compare to global or 15/26 week USA samples?

The table above shows that for the first five weeks of the media
object andor-210-211-212, the downloads from the USA are roughly 1
million, the rest of the world roughly 13 million, showing that
only 9% of all peers are "from" the USA. This shows the danger of
relying on a USA-centric data slice to see the global audience.

Furthermore, if one takes the longer duration of twenty weeks, the USA
slice deteriorates further: downloads from the USA are 3.8M, the
rest of the world is 47.6M, only 8% of all peers are "from" the
USA. When comparing 5 week to 20 week results, 1.2M USA to 47.6M or
slightly over 2% of all peers measured.

#### Top Downloads by Country

The top six countries for andor-210-211-212 are:
{% include andor-210-downloaders-per-country-per-week.svg %}

### Long Duration and the Shape of Streaming Serialization

Streaming affords the opportunity to serve a media object for what
seems to be an infinite amount of time. Forever! In practice, the
longevity of media on a steraming platform is less certain. But what about peer swarms?

Andor Season 1 was released in 2022, and Season 2 was released in 2025. At each event, peer to peer swarms were sampled for 26 weeks. And then these swarms are compared for size, locality, etc.

But what about Andor as a series of two seasons?

To gain some insight, while Andor Season 2 was being sampled, the last
episode of Season 1 (112) was re-sampled. So there are two sample data
sets for Andor 112, with the exact same inputs (BTIHA is the same):
one from 2022 and one from 2025.


#### Size Differences

The later sample is 3x original viewing.

#### Size Differences Normalized for ITU Growth

Estimate year-over-year P2P or internet population growth. Try to fit that to ITU(itu.int)  internet size and population estimates, see  ICT Development Index (IDI) 2025, ITU Facts and Figures 2025, Global Connectivity Report 2025.

#### Spatial Analysis.

Breaking apart the swarms by geoname_id, the behavior over time can be learned.
The swarms are divided into three partitions: only in the 2022 sample, only in the 2025 sample, and in both samples.

{% include andor-spatial-carto-table.html %}
<div style="height: 50px;"></div>



### Extrapolating to all episodes.

Only half of the episodes in Andor season two were sampled. Can the missing episodes (204-206, 207-209) be approximated using data from the first (201-203) and (210-212) episodes?

<div style="height: 50px;"></div>

{::nomarkdown}
<svg width="100" height=100>
	<circle cx="20" cy="50" r="10" fill="black"/>
</svg>
{:/}
