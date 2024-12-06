const { Firestore } = require("@google-cloud/firestore");

async function storeData(id, data) {
  const db = new Firestore();

  const predictCollection = db.collection("predictions");

  return predictCollection.doc(id).set(data);
}

async function getData() {
  const db = new Firestore();
  const predictCollection = db.collection("predictions");

  const snapshot = await predictCollection.get();

  if (snapshot.empty) {
    console.log("No documents yet");
    return [];
  }
  const results = [];

  snapshot.forEach((doc) => {
    results.push({
      id: doc.id,
      history: {
        ...doc.data(),
      },
    });
  });
  return results;
}

module.exports = { storeData, getData };
