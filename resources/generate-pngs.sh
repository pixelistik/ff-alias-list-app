#!/usr/bin/env bash
inkscape -z -e app-icon_LDPI.png    -w  36 -h  36 app-icon.svg
inkscape -z -e app-icon_MDPI.png    -w  48 -h  48 app-icon.svg
inkscape -z -e app-icon_HDPI.png    -w  72 -h  72 app-icon.svg
inkscape -z -e app-icon_XHDPI.png   -w  96 -h  96 app-icon.svg
inkscape -z -e app-icon_XXHDPI.png  -w 144 -h 144 app-icon.svg
inkscape -z -e app-icon_XXXHDPI.png -w 192 -h 192 app-icon.svg
inkscape -z -e app-icon_WEB.png     -w 512 -h 512 app-icon.svg
