<template>
  <div>
    <h1>{{ $t("menu.hotels") }}</h1>
      <v-skeleton-loader
        :loading="loading"
        :transition="transition"
        height="100"
        type="list-item-three-line"
      >
        <v-data-table
          v-model="selected"
          :headers="headers"
          :items="getHotels"
          :items-per-page="15"
          :footer-props="footerProps"
          :header-props="headerProps"
          item-key="ID"
          class="elevation-1"
          mobile-breakpoint="0"
          dense
        >
          <template v-slot:item="{ item }">
            <tr>
              <td>{{ item.Name }}</td>
              <td class="text-xs-right">
                <v-progress-linear
                  :value="item.Occupation * 100"
                  color="green"
                  height="25"
                  striped
                  rounded
                >
                  <template v-slot="{ value }">
                    <strong>{{ Math.ceil(value) }}%</strong>
                  </template>
                </v-progress-linear>
              <td class="text-xs-right">{{ dateToYYYYMMDD(item.Date) }}</td>
              <td class="text-xs-right">{{ (item.Price || 0).toFixed(2) }}</td>
              <td class="text-xs-right">
                <span v-if="item.Active" class="mdi mdi-access-point jbg-hotel-on"></span>
                <span v-else class="mdi mdi-access-point-network-off jbg-hotel-off"></span>
              </td>
            </tr>
          </template>
        </v-data-table>
    </v-skeleton-loader>
  </div>
</template>
<script>
import { mapGetters } from "vuex" 
import i18n from "../plugins/translate"
import { dateToYYYYMMDD } from "../utils/utils"

export default {
  name: "Hotels",
  data: () => ({
    dateToYYYYMMDD,
    headerProps: {
      sortByText:  i18n.t("vuetify.sort_by_text")
    },
    footerProps: {
      itemsPerPageOptions: [10, 15, 20, 50, 100], 
      itemsPerPageText: i18n.t("vuetify.rows_per_page_text")    
    },
    loading: true,
    transition: 'scale-transition',
    transitions: [
      {
        text: 'None',
        value: undefined,
      },
      {
        text: 'Fade Transition',
        value: 'fade-transition',
      },
      {
        text: 'Scale Transition',
        value: 'scale-transition',
      }
    ],
    pagination: {
        sortBy: 'Name'
      },
      selected: [],
      headers: [
        {
          text: i18n.t("name"),
          align: 'left',
          value: 'Name'
        },
        { text: i18n.t("tables.hotels.headers.occupation"), value: 'Occupation' },
        { text: i18n.t("date"), value: 'Date' },
        { text: `${i18n.t("tables.hotels.headers.price")} $`, value: 'Price' },
        { text: i18n.t("tables.hotels.headers.active"), value: 'Active' }
      ]
    }),
  beforeCreate() {
    this.$store.dispatch("getHotels").
      catch(err => {
        console.error("Hotels getHotels", err)
      }).
      finally(
        () => this.loading = false
      )
  },
  computed: {
    ...mapGetters(["getHotels"])
  }
}
</script>
<style lang="scss" scope>
  table {
    thead {
      tr > th:nth-child(1) .v-data-table-header-mobile__wrapper {
        min-width: 90px;
      }
    } 
    tbody {
      tr {
        color: rgb(200,200,200);
        background: rgb(74, 74, 78);
      }
      .v-progress-linear__content {
        color: white;
      }
      tr:nth-child(even) {
        background: rgba(74, 74, 78, .9);      
      }
      tr:hover {
        & .v-progress-linear__content,
        &:not(.v-data-table__expanded__content):not(.v-data-table__empty-wrapper) {
          color: black !important;
        }
      }    
      .v-progress-linear {
        min-width: 100px;
      }
    }
  }

</style>
