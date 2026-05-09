#!/usr/bin/env bash

./a60-meta-collection.exe ../data.ahsoka "Ahsoka, Ackolyte, Others" "" "" 0
./a60-meta-collection.exe ../data "SWU" "" "" 0
./a60-meta-collection.exe ../data "Andor S1,S2" "" "andor" 0
./a60-meta-collection.exe ../data "Mandalorian S1,S2,S3" "" "mandalorian" 1

./a60-meta-collection.country.exe ../data/andor-112-2022-week.json "Andor 112 2022"

./a60-meta-collection.country.exe ../data/andor-112-2025-week.json "Andor 112 2025"
