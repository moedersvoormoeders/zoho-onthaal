<template id="search">
  <div class="container">
    <div class="d-flex justify-content-center" v-if="loading">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>

    <div v-if="!loading">
      <h1>Onthaal</h1>
      <form m v-on:submit.prevent="search">
        <div class="row">
          <div class="col-8 big-search">
            <div class="input-group mb-2 mr-sm-2">
              <div class="input-group-prepend">
                <div class="input-group-text">{{prefix}}</div>
              </div>
              <input type="text" class="form-control" ref="search" v-model="doelgroepnummer" v-focus />
            </div>
          </div>
          <div class="col-4">
            <button
              type="button"
              class="btn btn-lg btn-success"
              v-on:click="search()"
              :disabled="searching"
            >
              <font-awesome-icon :icon="['fas', 'search']" /> Zoeken
            </button>
          </div>
        </div>
        <div class="row">
          <div class="col-4">
            <div class="input-group mb-3">
              <div class="input-group-prepend">
                <label class="input-group-text" for="inputGroupSelect01">Type</label>
              </div>
              <select class="custom-select" v-model="prefix">
                <option value="MVM">Doelgroep</option>
                <option value="E">Eenmaligen</option>
                <option value>Op naam zoeken</option>
              </select>
            </div>
          </div>
        </div>
      </form>
      <div class="row" v-if="results.length > 0">
        <table class="table">
          <colgroup>
            <col/>
            <col/>
            <col/>
            <col/>
            <col/>
            <col/>
            <col/>
            <col/>
            <col/>
            <col/>
          </colgroup>
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">Doelgroepnummer</th>
              <th scope="col">Voornaam</th>
              <th scope="col">Naam</th>
              <th scope="col">Dag</th>
              <th scope="col">Code</th>
              <th scope="col">Einddatum</th>
              <th scope="col">Classificatie</th>
              <th scope="col">Reden Controle</th>
              <th scope="col">Print</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in results" v-bind:key="result.id">
              <td>
                <font-awesome-icon :icon="['fas', 'check-square']" size="3x" style="color:green" v-if="result.classificatie == 'Actief'" />
                <font-awesome-icon :icon="['fas', 'exclamation-triangle']" size="3x" style="color:#e0cf50" v-if="result.classificatie == 'CONTROLE'" />
                <font-awesome-icon :icon="['far', 'history']" size="3x" style="color:#e0cf50" v-if="result.classificatie == 'TE VERLENGEN'" />
                <font-awesome-icon :icon="['fas', 'times-octagon']" size="3x" style="color:red" v-if="result.classificatie == 'Niet-actief'" />
              </td>
              <td>{{result.doelgroepnummer}}</td>
              <td>{{result.voornaam}}</td>
              <td>{{result.naam}}</td>
              <td>{{result.dag}}</td>
              <td>{{result.code}}</td>
              <td>{{result.einddatum}}
              <td>{{result.classificatie}}</td>
              <td>{{result.redenControle}}</td>
              <td>
                <form class="row">
                  <select class="col-5 m-1 form-control" v-model="printType">
                    <option>Gewoon</option>
                    <option>Voorrang</option>
                    <option>Man buiten</option>
                    <option>Leveren bij inschrijving</option>
                  </select>
                  <button type="button" class="col-5 m-1 btn btn-primary print-num" v-on:click="lookupVoeding(result)"><font-awesome-icon :icon="['fad', 'print']"/></button>
                  <div class="col-1">
                    <font-awesome-icon :icon="['fas', 'check-square']" size="3x" style="color:green" v-if="hasPrinted(result.doelgroepnummer)" />
                  </div>
                </form>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import * as voedingHelper from "../helpers/voeding"

export default {
  template: "#search",
  components: {},
  data: function() {
    return {
      printed: [],
      printType: "Gewoon",
      loading: true,
      doelgroepnummer: "",
      prefix: "MVM",
      searching: false,
      ticketCount: 1, 
      results: []
    };
  },

  methods: {
    hasPrinted: function(number) {
      console.log(this.printed)
      return this.printed.includes(number)
    },
    lookupVoeding: function(result) {
      var vm = this

      window.ZOHO.CRM.API.searchRecord({
        Entity: "voeding",
        Type: "word",
        Query: result.doelgroepnummer
      }).then((res) => {
        if (!res.data || res.data.length == 0) {
          this.$Simplert.open({
            title: "Voeding error!",
            message: "Geen voeding gegevens",
            type : "error",
            customCloseBtnText: "Sluiten",
            onClose: function() {
              vm.$refs.search.focus()
            }
          });
          return
        }

        window.ZOHO.CRM.API.getRecord({
          Entity: "Voeding",
          RecordID: res.data[0].id
        }).then((resDetail) => {
          return vm.print(result, resDetail.data[0])
        }, (error) => {
          this.$Simplert.open({
            title: "Voeding error!",
            message: error,
            type : "error",
            customCloseBtnText: "Sluiten",
            onClose: function() {
              vm.$refs.search.focus()
            }
          })
        })

        // readding this block turns on registration, this is either for after the corona crisis or when it gets worst
        // we all hope the first
        /*voedingHelper.voedingVandaag(res.data[0]).then(()=> {this.print(result, res.data[0])}, (error) => {
          this.$Simplert.open({
            title: "Voeding registratie error!",
            message: error,
            type : "error",
            customCloseBtnText: "Sluiten",
            onClose: function() {
              vm.$refs.search.focus()
            }
          })
        }) */

      }, (error) => {
        this.$Simplert.open({
          title: "Voeding error!",
          message: error,
          type : "error",
          customCloseBtnText: "Sluiten",
          onClose: function() {
            vm.$refs.search.focus()
          }
        });
      })
    },
    print: function(result, voedingResult) {
      var vm = this;
      result.ticketCount = this.ticketCount
      result.needsMelkpoeder = voedingHelper.needsMelkpoeder(voedingResult)
      result.needsVerjaardag = voedingHelper.needsVerjaardag(voedingResult)
      result.specialeVoeding = voedingResult.Speciale_voeding
      result.opmerking = voedingResult.Algemene_Opmerkingen
      result.printType = vm.printType

      sendPrint(result).then((response)=> {
          vm.printed.push(result.doelgroepnummer)

          if (response.status == "error") {
            this.$Simplert.open({
              title: "Printer probleem!",
              message: result.error,
              type : "error",
              customCloseBtnText: "Sluiten",
              onClose: function() {
                vm.$refs.search.focus()
              }
            });
            return
          }
          this.$Simplert.open({
            title: "Print verstuurd",
            message: "Print opdracht verstuurd naar de voeding",
            type: "success",
            customCloseBtnText: "Sluiten",
            onClose: function() {
              vm.$refs.search.focus()
            }
          });
          this.ticketCount++
      },(error)=> {
        this.$Simplert.open({
          title: "Printer probleem!",
          message: error,
          type : "error",
          customCloseBtnText: "Sluiten",
          onClose: function() {
            vm.$refs.search.focus()
          }
        });
      })
    },
    search: function() {
      let vm = this;

      // reset printType
      vm.printType = "Gewoon"
      this.searching = true;
      let entity = "Accounts"
      let searchPrefix = this.prefix
      let seachTerm = this.doelgroepnummer

      if (this.prefix == "E") {
        // dirty patch here, should be properly sent into it's own value in the future
        entity = "Eenmaligen"
        searchPrefix = ""
      }

      if (this.doelgroepnummer.length >= 11 && !isNaN(parseInt(this.doelgroepnummer,10))) {
        // we have a rijksregisternummer!
        seachTerm = this.doelgroepnummer.substring(0,11);
        searchPrefix = ""
      }

      window.ZOHO.CRM.API.searchRecord({
        Entity: entity,
        Type: "word",
        Query: `${searchPrefix}${seachTerm}`
      }).then(function(res) {
        vm.searching = false;

        vm.results = [];
        if (!res.data || res.data.length <= 0) {
          vm.$Simplert.open({
            title: "Geen Resultaten!",
            message: "Geen resultaten gevonden voor de zoekopdracht!",
            type: "error",
            customCloseBtnText: "Sluiten"
          });
          return;
        }


        if (vm.prefix == "E") {
          for (let result of res.data) {
            console.log(result)
            vm.results.push({
               naam: result.Name,
               voornaam: result.Eenmaligvoornaam,
               doelgroepnummer: result.EenmaligNummer,
               classificatie: result.EenmaligeStatus,
               einddatum: result.Last_Activity_Time,
            })
          }
          return
        }

        for (let result of res.data) {
          // a super long in statement just to say if a number is given check if it actually contains it
          // as zoho searches in all fields non-related entries do show up
          if (result.Doelgroep_nummer && searchPrefix == "MVM" && result.Doelgroep_nummer.indexOf(`${searchPrefix}${seachTerm}`) == -1) {
            continue
          }
          console.log(result)
          vm.results.push({
            id: result.id,
            naam: result.Account_Name,
            voornaam: result.Voornaam,
            doelgroepnummer: result.Doelgroep_nummer,
            code: result.Code,
            dag: result.Dag,
            classificatie: result.Rating,
            redenControle: result.Reden_Controle,
            einddatum: result.Nieuwe_evaluatie,
            typeVoeding: result.Geloof,
            kinderen: result.Aantal_12,
            volwassenen: result.Aantal_121,
          });
        }
      });

      vm.doelgroepnummer = "";
    }
  },

  created: function() {
    let vm = this;
    window.ZOHO.embeddedApp.on("PageLoad", function() {
      vm.loading = false;
    });
    window.ZOHO.embeddedApp.init();

    vm.loading = false; // RM ME
  }
};

async function sendPrint(data = {}) {
  console.log(data)
  const response = await fetch("https://print.voeding.mvm.maartje.dev/print", {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json'
       },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });
  return await response.json();
}
</script>
