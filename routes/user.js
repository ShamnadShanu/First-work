var express = require('express');
const { response } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const { route } = require('./admin');

const verifyLogin = (req,res,next)=>{
  if(req.session.userloggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/', function (req, res, next) {
  let userloggedIn=req.session.userloggedIn
  let userData=req.session.user
if(userloggedIn){
  productHelpers.getAllProducts().then((products)=>{
    res.render('user/view-products', {user:true,products,userData});
  })
}else{
  res.render('user/login')
}
})

router.get('/login',(req,res)=>{
  let userData=req.session.userloggedIn
  if(userData){
    res.redirect('/')
  }else{
    res.render('user/login',{'loginError':req.session.userloginError})
    req.session.userloginError=false
  }
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.userloggedIn=true
      req.session.user=response.user
      res.redirect('/')
    }else{
      req.session.userloginError='Invalid username and password'
      res.redirect('/login')
    }
  })  
})

router.get('/logout',(req,res)=>{
  req.session.user=false
  req.session.userloggedIn=false
  res.redirect('/')
})

router.get('/signup',(req,res)=>{
  let userData=req.session.user
  req.session.loggedIn=true
  
  if(userData){
    res.redirect('/')     
  }else{
    res.render('user/signup',{"exist":req.session.exist})
    req.session.exist=false
  }
})

router.post('/signup',(req,res)=>{
    userHelpers.doSignup(req.body).then((response)=>{
      console.log(response)
      req.session.userloggedIn=true
      req.session.user=response
    res.redirect('/')
    }).catch((err)=>{
      req.session.exist="Email is already used please login"
      res.redirect('/signup')
      
    })
    })

    


router.get('/cart',verifyLogin,(req,res)=>{
  userHelpers.getCart(req.session.user._id).then((response)=>{
    console.log(response);
    userHelpers.getCartTotal(req.session.user._id,response).then((total)=>{
      res.render('user/cart',{user:true,items:response,User: req.session.user,total:total })
    })
  })
})
router.get('/addtocart/:id',verifyLogin, (req, res) => {
  userHelpers.addTocart(req.params.id, req.session.user._id).then(() => {
  res.json(true)
  })
})

router.get('/orders',verifyLogin,(req,res)=>{
  res.render('user/orders',{user:true})
})
router.post('/change', verifyLogin, (req, res, next) => {
  console.log("fadjfkd");
  userHelpers.changeProductQuantity(req.body).then(async (response) => {   
    res.json(response)
  })
});
router.post('/remove',(req, res) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate,must-stale=0,post-check=0,pre-check=0')
  userHelpers.removecart(req.body).then(() => {
    console.log("mmm");
    res.json(true)
  })
});
router.get('/checkout',(req,res)=>{
res.render('user/checkout')
})

module.exports = router;