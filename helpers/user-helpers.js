var db = require("../config/connection");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");
let moment=require('moment')


module.exports = {
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      let exist = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          email: userData.email,
        });
      if (!exist) {
        userData.password = await bcrypt.hash(userData.password, 10);
        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne(userData)
          .then((data) => {
            resolve(data.ops[0]);
          });
      } else {
        reject();
      }
    });
  },
  doLogin: (userData) => {
    let response = {};

    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        bcrypt.compare(userData.password, user.password).then((status) => {
          if (status) {
            console.log("login success");
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("not a user");
        resolve({ status: false });
      }
    });
  },
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let Products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();
      resolve(Products);
    });
  },
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },
  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .removeOne({ _id: objectId(userId) })
        .then((response) => {
          resolve(response);
        });
    });
  },
  getUserDetails: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: objectId(userId) })
        .then((user) => {
          resolve(user);
        });
    });
  },
  updateUser: (userId, userDetails) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: objectId(userId) },
          {
            $set: { username: userDetails.username, email: userDetails.email },
          }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  addTocart: (proId, userId) => {
    let = prodObj = {
      item: objectId(proId),
      quantity: 1,
    };
    console.log(prodObj);
    return new Promise(async (resolve, reject) => {
      cart = await db
        .get()
        .collection(collection.CART)
        .findOne({ user: objectId(userId) });

      if (cart) {
        let proExist = await cart.products.findIndex(
          (product) => product.item == proId
        );
        console.log(proExist);
        if (proExist != -1) {
          db.get()
            .collection(collection.CART)
            .updateOne(
              { user: objectId(userId), "products.item": objectId(proId) },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART)
            .updateOne(
              { user: objectId(userId) },
              {
                $push: { products: prodObj },
              }
            )
            .then((response) => {
              resolve();
            });
        }
      } else {
        let CART = {
          user: objectId(userId),
          products: [prodObj],
        };
        db.get()
          .collection(collection.CART)
          .insertOne(CART)
          .then((data) => {
            resolve(data.ops[0]);
          });
      }
    });
  },
  getCart: (user) => {
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.CART)
        .aggregate([
          {
            $match: { user: objectId(user) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              products: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              products: 1,
              sub: { $multiply: ["$quantity", "$products.price"] },
            },
          }
        ])
        .toArray();
      if (data) {
        resolve(data);
      } else {
        resolve();
      }
    });
  },
  changeProductQuantity: (Data) => {
    let count = parseInt(Data.count);
    return new Promise(async (resolve, reject) => {
      let data = await db
        .get()
        .collection(collection.CART)
        .updateOne(
          { _id: objectId(Data.cart), "products.item": objectId(Data.product) },
          {
            $inc: { "products.$.quantity": count },
          }
        );
      resolve(true);
    });
  },
  removecart: (Data) => {
    console.log('fji');
    return new Promise((resolve, reject) => {
        db.get().collection(collection.CART)
            .updateOne({ _id: objectId(Data.cartId) },
                {
                    $pull: { products: { item: objectId(Data.proId) } }
                }
            ).then(() => {
                resolve()
            })
    })
},
getCartTotal:(user,product)=>{
    if(product){
       return new Promise(async(resolve,reject)=>{
   let total=await db.get().collection(collection.CART).aggregate([{
                  $match:{user:objectId(user)}
              },
              {
                  $unwind:'$products'
              },{
                  $project:{
                      item:'$products.item',
                      quantity:'$products.quantity'
                  }
              },
              {
                  $lookup:{
                      from:collection.PRODUCT_COLLECTION,
                      localField:'item',
                      foreignField:'_id',
                      as:'products'
                  }
              },{
                  $project:{
                      item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                  },
              },{
                  $group:{
                    _id:null,
                      total:{$sum:{$multiply:['$quantity','$products.price']}}
                  }
              }
            ]).toArray()
           let hai=total[0].total
             resolve(hai)
             
            })
    }
  
},
getCartProductList:(user)=>{
  return new Promise(async(resolve,reject)=>{
      let cart=await db.get().collection(collection.CART).findOne({user:objectId(user)})
      if(cart.products){
          resolve(cart.products)

      }
  })
},
placeOrder:(order,products,total)=>{
  return new Promise((resolve,reject)=>{
  console.log(order,products,total);
  let status=order['payment-method']==='COD'?'Placed':'Pending'
  let orderObj={
      deliveryDetails:{
          userName:order.fname+" "+order.lname,
          mobile:order.phone,
          address:order.address,
          pincode:order.pin
              },
      userId:objectId(order.user),
      paymentMethod:order['payment-method'],
      products:products,  
      totalAmount:total,
      status:status,
      date:moment(new Date()).format('L')
  }
  db.get().collection(collection.ORDER_COLLECTIONS).insertOne(orderObj).then((response)=>{
      db.get().collection(collection.CART).removeOne({user:objectId(order.user)}).then(()=>{
        resolve(response.ops[0]._id)
      })
  })
  })
  },
  getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let orders=await db.get().collection(collection.ORDER_COLLECTIONS).find().toArray()
        resolve(orders)
    })
},
};
