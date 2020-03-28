export const needsMelkpoeder = (result) => {
    
    if (!result.Geboortedata || !result.Geschiedenis) {
      console.log(result)
        return false
    }

    const lines = result.Geboortedata.split("\n")
    for (let line of lines) {
        const parts = line.split(" ")
        const date = Date.parse(parts[0])
        if (isNaN(date)) {
            continue
        }
        if ((Date.now() - date)/1000/60/60/24 < 730) { // age in days
            let hadMelkpoeder = false

            // check if melkpoeder has been given before
            for (let pakket of result.Geschiedenis) {
              if (!pakket.Gekregen) {
                continue
              }
              for (let gekregen of pakket.Gekregen) {
                if (gekregen.includes("Melkpoeder")) {
                  hadMelkpoeder = true
                }
              }
            }
            return hadMelkpoeder
        }
    }

    return false
}

export const needsVerjaardag= (result) => {
  if (!result.Geboortedata) {
      return false
  }

  const today = new Date()

  const lines = result.Geboortedata.split("\n")
  for (let line of lines) {
      const parts = line.split(" ")
      let date = Date.parse(parts[0])
      if (isNaN(date)) {
          continue
      }
      date = new Date(date)
      const birthdayThisYear = new Date(today.getFullYear(), date.getMonth(), date.getDate())
      if ((birthdayThisYear.getTime() - Date.now())/1000/60/60/24 < 6 && (birthdayThisYear.getTime() - Date.now())/1000/60/60/24 > -1) { // birthday in this week
          return true
      }
  }

  return false
}

// JS version of ZOHO button
export const voedingVandaag = async (data) => {
    const today = new Date();
    for (let pakket of data.Geschiedenis) {
      if (pakket.Datum == formatDate(today)) {
        throw new Error("Al pakket gekregen vandaag")
      }
    }

    console.log(data.Geschiedenis)
    const newGeschiedenis = [
      {
        Datum: formatDate(today),
        Gekregen: [
         "Voeding"
        ],
      }
    ].concat(data.Geschiedenis);

    data.Geschiedenis = newGeschiedenis

    await window.ZOHO.CRM.API.updateRecord({
        Entity: "Voeding",
        Trigger: ["workflow"],
        APIData: data,
    })
}

function formatDate(d) {
  var month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [year, month, day].join("-");
}