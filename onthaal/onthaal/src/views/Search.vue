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
                <font-awesome-icon :icon="['fas', 'times-octagon']" size="3x" style="color:red" v-if="result.classificatie == 'Niet-actief'" />
              </td>
              <td>{{result.doelgroepnummer}}</td>
              <td>{{result.voornaam}}</td>
              <td>{{result.naam}}</td>
              <td>{{result.dag}}</td>
              <td>{{result.code}}</td>
              <td>{{result.classificatie}}</td>
              <td>{{result.redenControle}}</td>
              <td>
                <form class="row">
                  <input type="number" :value="ticketCount" class="col-6 mr-2">
                  <button type="button" class="col-2 btn btn-primary" v-on:click="print(result)"><font-awesome-icon :icon="['fad', 'print']"/></button>
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
      this.$Simplert.open({
          title: "Print werkt nog niet!",
          message: "Printen is nog niet geimplementeerd",
          type: "error",
          customCloseBtnText: "Sluiten",
          onClose: function() {
            vm.$refs.search.focus()
          }
      });
      this.ticketCount++
      console.log(result)
    },
    search: function() {
      let vm = this;
      this.searching = true;
      window.ZOHO.CRM.API.searchRecord({
        Entity: "Accounts",
        Type: "word",
        Query: `${this.prefix}${this.doelgroepnummer}`
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
</script>
