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
                  <input type="number" :value="ticketCount" class="col-6 mr-1">
                  <button type="button" class="col-5 btn btn-primary" v-on:click="print(result)"><font-awesome-icon :icon="['fad', 'print']"/></button>
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
export default {
  template: "#search",
  components: {},
  data: function() {
    return {
      loading: true,
      doelgroepnummer: "",
      prefix: "MVM",
      searching: false,
      ticketCount: 1, 
      results: []
    };
  },

  methods: {
    print: function(result) {
      var vm = this;

      result.ticketCount = this.ticketCount

      sendPrint(result).then(()=> {
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
      this.searching = true;
      let entity = "Accounts"
      if (this.prefix == "E") {
        // dirty patch here, should be properly sent into it's own value in the future
        entity = "Eenmaligen"
      }
      window.ZOHO.CRM.API.searchRecord({
        Entity: entity,
        Type: "word",
        Query: `${this.prefix == "E" ? "" : this.prefix}${this.doelgroepnummer}`
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
