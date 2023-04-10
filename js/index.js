import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js";
import {
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  doc,
  deleteDoc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";
let register = false; // inicializar register en false

$(function () {
  listenLogin(register); // llama la funcion y le pasa el valor register

  $(".products")
    .find(".edit")
    .on("click", (e) => {
      e.preventDefault();
      console.log("click en editar");
    });
  $(".login")
    .find("#btnSign-in")
    .on("click", (e) => {
      e.preventDefault();
      console.log("click en iniciar sesion");
      /*  $(".login").find("#btnSign-in").off("click"); //limpar el evento click del login */
      login();
    });
  $(".login")
    .find("#btnSign-up")
    .on("click", (e) => {
      e.preventDefault();
      console.log("click en registrarse");
      send();
    });
  $("#btnSign-out").on("click", async () => {
    $("#btnSend").off("click");
    $("#password").val("");
    $("#email").val("");
    $(".product-list").empty();

    await signOut(auth);
  });
});

async function send() {
  let email = $("#email").val();
  let password = $("#password").val();
  console.log(email);
  console.log(password);
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    $("#password").val("");
    register = true;
    console.log(register);
    listenLogin(register);

    const markup = `<div class="messageSucces">El usuario ha sido registrado con exito, ahora y apuedes iniciar sesión</div>`;
    $(".login").append(markup); //MOSTRAR EL ERROR EN PANTALLA
    $(".messageSucces").hide(5000); //MOSTRAR POR 5 SEGUNDOS EL MENSAJE
  } catch (error) {
    console.log(error);
    if (error.code === "auth/invalid-email") {
      const message = "el correo no es valido";
      showMessage(message);
    } else if (error.code === "auth/weak-password") {
      const message = "contraseña incorrecta";
      showMessage(message);
    } else if (error.code === "auth/email-already-in-use") {
      const message = "el correo ya esta registrado";
      showMessage(message);
    } else if (error.code === "auth/internal-error") {
      const message = "Por favor ingrese usuario y contraseña";
      showMessage(message);
    } else if (error.code === "auth/missing-email") {
      const message = "Por favor ingrese el correo";
      showMessage(message);
    }
  }
}

async function login() {
  let email = $("#email").val();
  let password = $("#password").val();

  console.log(email);
  console.log(password);

  try {
    const credentials = await signInWithEmailAndPassword(auth, email, password);

    if (credentials) {
      /*     $("#sign-in").css("display", "none");*/
      $("#btnSign-out").show();
      $(".login").css("display", "none");
      $(".add__products").show();
      $(".product-list").empty();
      $(".login").find("#btnSign-in").off("click");
    }
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      const message = "El usuario no fue encontrado";
      showMessage(message);
    } else if (error.code === "auth/wrong-password") {
      const message = "La contraseña es incorrecta";
      showMessage(message);
    } else {
      const message = "Los datos ingresados son erroneos";
      showMessage(message);
    }
  }
}
function listenLogin(register) {
  if (register == false) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // si el usuaruo esta autenticado muestra el formulario de registro y oculta el formulario de login
        $(".container").hide();
        $(".welcome").show();
        $(".add__products").show();
        $("#btnSign-out").show();
        addProduct(user.uid);
      } else {
        $(".container").show();
        $(".login").show();
        $(".welcome").hide();
        $(".add__products").hide();
        $("#btnSign-out").hide();
      }
    });
  } else {
    $(".container").show();
    $(".login").show();
    $(".welcome").hide();
    $(".add__products").hide();
    $("#btnSign-out").hide();
  }
}

function addProduct(uid) {
  $("#btnSend").on("click", (e) => {
    e.preventDefault();
    $(".product-list").empty();
    let product = $("#task").val();
    $("#task").val("");
    addDoc(collection(db, "products-" + uid), {
      product: product,
    });
  });

  getProduct(uid);
}

async function getProduct(uid) {
  $(".product-list").empty();

  onSnapshot(collection(db, "products-" + uid), (getProduct) => {
    getProduct.forEach((product) => {
      const productAdded = product.data().product;
      const idProduct = product.id;

      const markup = $(`<li id="products"class="products">      
          
         <input  class="product__added" type="text" placeholder="${productAdded}" readonly>
       <div class="buttons">   
         <img class="edit" src="./images/editarr.png" alt="editar"> 
         <img class="confirm" src="./images/confirm.png" alt="confirm"> 

         <div id="delete"class="delete">x</div>       
        </div>  
 </li>`);
      $(".product-list").append(markup);
      editProduct(markup, idProduct, uid, productAdded);

      markup.find(".delete").on("click", (e) => {
        markup.find(".delete").off("click");
        e.preventDefault();

        $(".product-list").empty();

        deleteProduct(idProduct, uid);
      });
    });
  });
}

//////////////delete product//////////////////////////////////////////
function deleteProduct(idProduct, uid) {
  deleteDoc(doc(db, "products-" + uid, idProduct));
}
//////////////////////edit prouct////////////////////
function editProduct(markup, idProduct, uid, productAdded) {
  markup.find(".edit").on("click", (e) => {
    markup.find(".product__added").prop("readonly", false);
    markup.find(".product__added").css("background-color", "white");
    markup.find(".product__added").on("keydown", async (e) => {
      markup.find(".confirm").on("click", (e) => {
        console.log("click en confirm");
        newDoc(uid, idProduct, markup);
      });

      if (e.keyCode === 13) {
        newDoc(uid, idProduct, markup);
      }
    });
  });

  $(document).on("keydown", (e) => {
    if (e.keyCode === 27) {
      console.log("esc");
      e.stopPropagation();

      markup.find(".product__added").prop("readonly", true);
      markup.find(".product__added").css("background-color", "#d4d2d4");
      markup.find(".product__added").prop("placeholder", productAdded);
    }
  });
  $(document).on("click", (e) => {
    if (e.keyCode === 27) {
      console.log("click  ");
      e.stopPropagation();

      markup.find(".product__added").prop("readonly", true);
      markup.find(".product__added").css("background-color", "#d4d2d4");
      markup.find(".product__added").prop("placeholder", productAdded);
    }
  });
}

function newDoc(uid, idProduct, markup) {
  let newProduct = markup.find(".product__added").val();
  markup.find(".product__added").prop("readonly", true);
  markup.find(".product__added").css("background-color", "#d4d2d4");
  $(".product-list").empty();
  updateDoc(doc(db, "products-" + uid, idProduct), {
    product: newProduct,
  });
}

/////////////////////////mostraar mensaje exitoso o de error segun corresponda/////////////////////////////
function showMessage(message) {
  const markup = `<div class="message">${message}</div>`;
  $(".login").append(markup); //MOSTRAR EL ERROR EN PANTALLA
  $(".message").hide(5000); //MOSTRAR POR 3 SEGUNDOS EL MENSAJE DE ERROR
}
