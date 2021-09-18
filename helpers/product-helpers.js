var db = require('../config/connection');
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectID;
const { response } = require('../app');

module.exports = {
    addProduct: (product, callback) => {
        console.log(product);
        db.get().collection('product').insertOne(product).then((data) => {
            callback(data.ops[0]._id)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    editProduct:()=>{
        return new Promise((resolve,reject)=>{
db.get().collections(collection.PRODUCT_COLLECTION).updateOne({id:objectId()}).then((response)=>{
    resolve(response)
})
        })
    }
}