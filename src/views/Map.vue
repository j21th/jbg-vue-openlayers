<template>
  <div id="map">
    <div ref="mapPopup">
      <v-card id="map-popup-content" v-show="showPopup">
        <v-system-bar color="white">
          <span class="jbg-title">{{ selectedHotel.Name }}</span>
          <v-spacer />
          <v-icon @click="closePopup()">mdi-close</v-icon>
        </v-system-bar>
        <v-card-text>
          <v-avatar size="24" :color="selectedHotel.Color">
          </v-avatar>
          <v-img
            v-if="selectedHotel.Img"
            :src="selectedHotel.Img"
            aspect-ratio="1"
            class="grey lighten-2"
            >
            <template v-slot:placeholder>
              <v-row
              class="fill-height ma-0"
              align="center"
              justify="center"
              >
                <v-progress-circular
                indeterminate
                color="grey lighten-5"
                ></v-progress-circular>
              </v-row>
            </template>
          </v-img>        
          <div class="jbg-coordinates" v-if="selectedHotel.Coordinates">
            <span>{{ `Lon: ${selectedHotel.Coordinates[0]}` }}</span>
            <span>{{ `Lat: ${selectedHotel.Coordinates[1]}` }}</span>
          </div>

          <v-container>
            <v-row>
              <v-col cols="6">{{ $t('occupation') }}</v-col>
              <v-col cols="6">
                <v-progress-linear
                  :value="selectedHotel.Occupation"
                  color="green"
                  height="20"
                  striped
                  rounded
                >
                  <template v-slot="{ value }">
                    <strong>{{ Math.ceil(value) }}%</strong>
                  </template>
                </v-progress-linear>

              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">{{ $t('price') }}</v-col>
              <v-col cols="6" >
                {{ `${selectedHotel.Price} $` }}
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">{{ $t('state') }}</v-col>
              <v-col cols="6" >
                <span v-if="selectedHotel.Active" class="mdi mdi-access-point jbg-hotel-on"></span>
                <span v-else class="mdi mdi-access-point-network-off jbg-hotel-off"></span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">{{ $t('date') }}</v-col>
              <v-col cols="6" >
                {{ dateToYYYYMMDD(selectedHotel.Date) }}
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
        </v-card-actions>
      </v-card>
    </div>
  </div>
</template>

<script>

import 'ol/ol.css'
import Feature from 'ol/Feature'
import Map from 'ol/Map'
import Overlay from 'ol/Overlay'
import Point from 'ol/geom/Point'
import VectorSource from 'ol/source/Vector'
import View from 'ol/View'
import {Style, Fill, Stroke, Circle} from 'ol/style'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'
import OSM from 'ol/source/OSM'
import {fromLonLat} from 'ol/proj'
import { dateToYYYYMMDD } from "../utils/utils"
import { mapGetters } from "vuex" 

const eColours = {
  red: "rgba(200, 0, 0, 1)",
  redTrans: "rgba(200, 0, 0, 0.5)",
  green: "rgba(3, 175, 0, 1)",
  greenTrans: "rgba(3, 175, 0, 0.5)",
  orange: "rgba(255, 177, 0, 1)",
  orangeTrans: "rgba(255, 177, 0, 0.5)",
  inactive: "rgba(150, 150, 150, 1)",
  inactiveTrans: "rgba(200, 200, 200, 0.7)"
  
}

export default {
  name: "Map",
  beforeDestroy() {
    window.removeEventListener("touchstart", this.touchStart)  
  },
  mounted() {
    const that = this
    this.$store.dispatch("setLoading", true)

    setTimeout(() => {
      window.addEventListener("touchstart", that.touchStart, { passive: false })
      that.createMap()
      that.createOverlay()

      that.$store.dispatch("getHotels")
        .then(hotels => that.addMarkers(hotels))
        .catch(err => {
          console.error("Hotels getHotels", err)
        })
    })
  },
  data: () => ({ 
    dateToYYYYMMDD,
    markerLayers: [],
    iconMarkers: {
      inactive: new Style({
        image: new Circle({
          fill: new Fill({ color: eColours.inactiveTrans }),
          stroke: new Stroke({ color: eColours.inactive, width: 1.5 }),
          radius: 4
        }),
        fill: new Fill({ color: eColours.inactiveTrans }),
        stroke: new Stroke({ color: eColours.inactive, width: 1.5 })
      }),
      red: new Style({
        image: new Circle({
          fill: new Fill({ color: eColours.redTrans }),
          stroke: new Stroke({ color: eColours.red, width: 1.25 }),
          radius: 5
        }),
        fill: new Fill({ color: eColours.redTrans }),
        stroke: new Stroke({ color: eColours.red, width: 1.25 })
      }),
      orange: new Style({
        image: new Circle({
          fill: new Fill({ color: eColours.orangeTrans }),
          stroke: new Stroke({ color: eColours.orange, width: 1.25 }),
          radius: 5
        }),
        fill: new Fill({ color: eColours.orangeTrans }),
        stroke: new Stroke({ color: eColours.orange, width: 1.25 })
      }),
      green: new Style({
        image: new Circle({
          fill: new Fill({ color: eColours.greenTrans }),
          stroke: new Stroke({ color: eColours.green, width: 1.25 }),
          radius: 5
        }),
        fill: new Fill({ color: eColours.greenTrans }),
        stroke: new Stroke({ color: eColours.green, width: 1.25 })
      })
    },
    map: null,
    selectedHotel: {},
    overlay: null,
    showPopup: false
  }),
  props: {
    center: {
      type: Object,
      default: () => {
        return { lon: -3.70325, lat: 40.4167 } //Madrid
      }
    }
  },
  computed: {
    ...mapGetters(["getHotels"])
  },
  watch: {
    getHotels(hotels) {
      if (!this.map) {
        return
      }
      this.addMarkers(hotels)
    }
  },
  methods: {
    getColor(Active, Occupation) {
      if (!Active) {
        return eColours.inactive
      } else {
        if (Occupation > 0.50) {
          return eColours.green
        } else if (Occupation > 0.25) {
          return eColours.orange
        } else {
          return eColours.red
        }
      }
    },
    closePopup() {
      this.showPopup = false
    },
    createMap() {
      const rasterLayer = new TileLayer({
        source: new OSM()
      })
      const { lon, lat } = this.center
      this.map = new Map({
        layers: [rasterLayer],
        target: document.getElementById('map'),
        view: new View({
          center: fromLonLat([lon, lat]),
          zoom: 3
        })
      })
    },
    createOverlay() {
      this.overlay = new Overlay({
          element: this.$refs.mapPopup,
          autoPan: true,
          autoPanAnimation: { duration: 250 }
      })

      this.map.addOverlay(this.overlay)
      
      const that = this 
      this.map.on('click', function (event) {
        if (that.map.hasFeatureAtPixel(event.pixel) === true) {
          const features = []
          that.map.forEachFeatureAtPixel(event.pixel, function (feature) {
            features.push(feature)
          })
          if (features.length > 0) {
            const feature = features[0]
            const { Name, Price, Active, Occupation, Date, Coordinates, Img } = feature.getProperties()  
            that.selectedHotel = { 
              Name, 
              Price: ((Price || 0)).toFixed(2), 
              Active, 
              Occupation: Math.trunc((Occupation || 0) * 100), 
              Date,
              Color: that.getColor(Active, Occupation),
              Coordinates,
              Img
            } 
            const coordinate = event.coordinate
            that.showPopup = true
            setTimeout(() => {
              that.overlay.setPosition(coordinate)  
            }, 0)
          }
        } else {
          that.overlay.setPosition(undefined)
          that.closePopup()
        }
      })
    },
    addMarkers(hotels) {
      this.$store.dispatch("setLoading", true)

      if (this.map) {
        this.closePopup()
        this.markerLayers.forEach(mLayer => {
          this.map.removeLayer(mLayer);
        })
        this.markerLayers = []
      }
      if (!hotels) {
        this.$store.dispatch("setLoading", false)
        return
      }
      hotels.forEach(hotel => this.addMarker(hotel))
      this.$store.dispatch("setLoading", false)

    },
    addMarker(hotel) {
      const { Coordinates, Name, Price, Date, Occupation, Active, Img } = hotel
      const marker = new VectorLayer({
      source: new VectorSource({
          features: [
              new Feature({
                  geometry: new Point(fromLonLat(Coordinates)),
                  Name,
                  Price,
                  Occupation,
                  Date,
                  Active,
                  Coordinates,
                  Img
              })
          ]})})

      if (!Active) {
        marker.setStyle(this.iconMarkers.inactive)
      } else {
        if (Occupation > 0.50) {
          marker.setStyle(this.iconMarkers.green)
        } else if (Occupation > 0.25) {
          marker.setStyle(this.iconMarkers.orange)
        } else {
          marker.setStyle(this.iconMarkers.red)
        }
      }
      this.markerLayers.push(marker)
      this.map.addLayer(marker)
    }
  },  
  touchStart(e) {
    e.preventDefault()
  }
}
</script>

<style scope lang="scss">
  $jbg-text-shadow: 1px 1px 1px rgba(50, 50, 50, 0.8);

  img {
    max-height: 100px;
  }
  #map {
    width: 100%;
    cursor: pointer;
  }
  .jbg-big {
    #map {
      width: calc(100% - #{$jbg-drawer-w});
      height: calc(100vh - #{$jbg-header-h});
      top: $jbg-header-h;    
    }
  }
  .jbg-small {
    #map {
      height: calc(100vh - #{$jbg-header-h});
    }
  }
  .jbg-title {
    font-weight: bold;
    text-transform: uppercase;
  }
  .ol-zoom-in, .ol-zoom-out {
    background: $jbg-color-green-1 !important;
  }
  #map-popup-content {
    width: 200px;
    background: transparent;
    .v-progress-linear__content {
      color: white;
      font-size: .7rem;
    }
    .v-progress-linear {
      background: #425443;
    }
    .col {
      padding: 0px 4px !important;
      color: white;
    }
    .row .col  {
      text-align: right !important;
    }
    .container {
      .row { 
        font-size: .7rem;
        
        > div:first-child {
          background: linear-gradient(45deg, #6b6b6b, transparent);
          border-radius: 10px 0px 0px 10px;
          color: white;
        }
        > div:last-child {
          text-shadow: $jbg-text-shadow;
        }
      }
    }
    .v-card__text {
      background: rgba(100, 100, 100, 0.6);
    }
    .v-system-bar, .v-card__actions {
      background: $jbg-color-gray !important;
      color: white;
      .v-icon {
        color: white;
      }
    }
  
  }
  .jbg-coordinates {
    font-size: 0.7rem;
    display: flex;
    flex-flow: column;
    text-align: center;
    color: white;
    text-shadow: $jbg-text-shadow;
  }

</style>
