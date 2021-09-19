var db = require('../config/connection');
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectID;
const bcrypt = require('bcrypt')


module.exports={
    // doLogin:(adminData)=>{
    //     let adminLoginStatus=false
    //     let response={}
    
    //     return new Promise(async(resolve,reject)=>{
    //         let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({email:adminData.email})
    //         if(admin){
    //             bcrypt.compare(adminData.password,admin.password).then((status)=>{
    //                 if(status){
    //                     console.log('login success');
    //                     response.admin=user
    //                     response.status=true
    //                     resolve(response)
    //                 }else{
    //                     console.log('login failed');
    //                     resolve({status:false})
    //                 }
    //             })
    //         }else{
    //             console.log('not a admin');
    //             resolve({status:false})
    //         }
    //     })
    // }

    doLogin:(adminData)=>{
        let loginStatus=false
        let response={}
    
        return new Promise((resolve,reject)=>{
            let adminDefined={email:'admin@gmail.com',password:'1234'}
            if(adminData.email==adminDefined.email&&adminData.password==adminDefined.password){
                response.admin=adminDefined
                response.status=true
                resolve(response)
            }else{
                resolve({status:false})
            }
        })
    },

    createuser:(userData)=>{

        return new Promise(async(resolve,reject)=>{
            let exist=await db.get().collection(collection.USER_COLLECTION).findOne({
                email:userData.email})
            if(!exist){
                userData.password=await bcrypt.hash(userData.password,10)
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                    resolve(data.ops[0])
                 })
        }else{
            reject()
         } 
         }) 
},

         
}
