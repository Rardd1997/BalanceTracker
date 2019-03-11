const express = require('express');
const mongodb = require('mongodb');

const router = express.Router();

// Get Balance
router.get('/balance/:date', async (req, res) => {
  const purchases = await loadPostsCollection();
  let dateFilter = new Date(req.params.date);
  dateFilter = dateFilter.toISOString().slice(0, 8);
  dateFilter += "01";
  const purchaseArr = await purchases.find({
    createdAt: {
      $gte: dateFilter
    }
  }).toArray();
  let sum = 0;
  console.log(purchaseArr);
  if (purchaseArr.length > 0) {
    sum = purchaseArr.map((item) => item.amount).reduce((acc, item) => acc + item);
  }
  res.send({
    balance: 3000 - sum
  });
});

// Get Posts
router.get('/', async (req, res) => {
  const purchases = await loadPostsCollection();
  res.send(await purchases.find({}).toArray());
});

// Add Post
router.post('/', async (req, res) => {
  const purchases = await loadPostsCollection();
  const amount = req.body.amount;
  try {
    await purchases.insertOne({
      text: req.body.text,
      amount: parseFloat(amount.replace(",", ".")),
      type: req.body.type,
      createdAt: req.body.purchDate
    });
  } catch (err) {
    console.log(err);
  }
  res.status(201).send();
});

// Delete Post
router.delete('/:id', async (req, res) => {
  const purchases = await loadPostsCollection();
  await purchases.deleteOne({
    _id: new mongodb.ObjectID(req.params.id)
  });
  res.status(200).send();
});

async function loadPostsCollection() {
  const client = await mongodb.MongoClient.connect(
    'mongodb://vue_user:Vue_passw0rd@ds047484.mlab.com:47484/vue_express', {
      useNewUrlParser: true
    }
  );

  return client.db('vue_express').collection('purchases');
}

module.exports = router;