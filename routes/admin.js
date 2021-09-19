var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
var userHelper = require('../helpers/user-helpers');
var adminHelpers = require('../helpers/admin-helpers');
const { response } = require('express');
const verifyadminLogin = (req,res,next)=>{
  if(req.session.adminLoggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

/* GET products listing. */
router.get('/', function (req, res, next) {
  let adminLoggedIn = req.session.adminLoggedIn

  if (adminLoggedIn) {
      userHelper.getAllProducts().then((Products) => {
        res.render('admin/all-products', {
        admin: true,
        Products
      });
    })
  }else{
    res.render('admin/login')
  }

})

router.get("/products", (req, res) => {
  console.log("hoiidso");
  res.render('admin/add-products', {
    admin: true
  })
})
router.get('/signup',(req,res)=>{
  let userData=req.session.user
  let loggedIn=req.session.adminLoggedIn
  if(loggedIn){
    res.redirect('/')     
  }else{
    res.render('user/signup')
  }
})
router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response)
    req.session.adminLoggedIn=true
    req.session.add=response
  res.redirect('/admin')
  })
})

router.post('/add-products', (req, res) => {
  console.log(req.files.image)

  productHelper.addProduct(req.body, (id) => {
    let image = req.files.image
    image.mv('./public/images/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('admin/view-products');
        res.redirect('/admin')
      } else {
        console.log(err)
      }
    })

  });
})

router.get('/delete-product/:id', (req, res) => {
  let proId = req.params.id
  productHelper.deleteProduct(proId).then((response) => {
    res.redirect('/admin')
  })
})
router.get('/edit-product/:id',(req,res)=>{
  let proId =req.params.id
  productHelper.editProduct(proId).then((response)=>{
    res.redirect('/admin')
  })
})

/* GET users data*/
 router.get('/all-products', (req, res) => {
   let loggedIn=req.session.adminLoggedIn
   if(loggedIn){
   userHelper.getAllProducts().then((Products) => {
     res.render('admin/all-products', {
       admin: true,
       Products
     })
   })}else{
     res.redirect('/admin/login')
   }
 })

router.get('/delete-user/:id', (req, res) => {
  let deleteUser=req.session.adminLoggedIn
  if(deleteUser){
    let userId = req.params.id
    userHelper.deleteUser(userId).then((response) => {
      res.redirect('/admin/all-users')
    })
  }
})

router.get('/edit-user/:id', async (req, res) => {
  let edituser=req.session.adminLoggedIn
if(edituser){
  let user = await userHelper.getUserDetails(req.params.id)
  console.log(user);
  res.render('admin/edit-user', {
    user
  })}
  else{
    res.redirect('/admin/login')
  }
})

router.post('/edit-user/:id', (req, res) => {
let edituser=  req.session.adminLoggedIn
if(edituser){
  userHelper.updateUser(req.params.id, req.body).then(() => {
    res.redirect('/admin')
  })
} else{
  res.redirect('/admin/login')
} 

})

router.get('/login',(req, res)=>{
  let loggedIn= req.session.adminLoggedIn

  if(loggedIn){
    res.redirect('/admin')
  }else{
    res.render('admin/login',{adminLoginError:req.session.adminLoginError})
    req.session.adminLoginError=false
    req.session.add=false
  }
  
})

router.post('/login',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminLoggedIn=true
      req.session.add=response.admin
      res.redirect('/admin')
    }else{
      req.session.adminLoginError='Invalid username and password'
      res.redirect('/admin/login')
    }
  })    
})

router.get('/logout',(req,res)=>{
  req.session.add=false
  req.session.adminLoggedIn=false
  res.redirect('/admin')
})
router.get('/createuser',(req,res)=>{
let loggedIn=req.session.adminLoggedIn
if(loggedIn){
  res.render('admin/create-user',{"exist":req.session.exist})
  req.session.exist=false
}else{
  res.redirect('/admin')
} 
})
router.post('/createuser',(req,res)=>{
 let loggedIn= req.session.adminLoggedIn
 if(loggedIn){
  adminHelpers.createuser(req.body).then((response)=>{
    console.log(response)
    req.session.userloggedIn=true
    req.session.user=response
  res.redirect('/admin')
  }).catch((err)=>{
    req.session.exist="Email is already used please check"
    res.redirect('/admin/createuser')
    exist=null
  })
}else{
  res.redirect('/admin/user')
}
 
  })
  // router.get('/all-users',(req,res)=>{
  //   if(req.session.adminLoggedIn){
  //     userHelper.getAllUsers().then((users)=>{
  //       res.render('admin/all-users',{
  //         admin:true,
  //         users
  //       })
  //     })
  //   }else{
  //     res.redirect('/admin')
  //   }
  
  // })
router.get('/all_orders',verifyadminLogin,(req,res)=>{
  userHelper.getAllOrders().then((response)=>{
    console.log(response);
    res.render('admin/all-orders',{admin:true,orders:response})
  })
})
module.exports = router;