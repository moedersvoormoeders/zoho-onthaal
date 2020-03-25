export const needsMelkpoeder = (result) => {
    if (!result.Geboortedata) {
        return false
    }

    const lines = result.Geboortedata.split("\n")
    for (let line of lines) {
        const parts = line.split(" ")
        const date = Date.parse(parts[0])
        if (isNaN(date)) {
            continue
        }
        if ((Date.now() - date)/1000/60/60/24 < 365) { // age in days
            return true
        }
    }

    return false
}

// JS version of ZOHO button
export const voedingVandaag = async (result) => {

    const voedingData = await window.ZOHO.CRM.API.getRecord({
        Entity: "Voeding",
        RecordID: result.id
    })

    if (!voedingData.data || voedingData.data.length == 0) {
        throw new Error("No data found")
    }

    const data = voedingData.data[0]

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