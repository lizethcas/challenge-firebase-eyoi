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
let register = false;
/* let editStatus = false; */
$(function () {
  listenLogin(register);

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
      $(".login").find("#btnSign-in").off("click"); //limpar el evento click del login
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
    console.log(register);
    onAuthStateChanged(auth, (user) => {
      console.log("aqui");
      console.log(register);
      if (user) {
        console.log("esta logeado");
        $(".container").hide();
        $(".welcome").show();
        $(".add__products").show();
        $("#btnSign-out").show();

        addProduct(user.uid);
      } else {
        console.log("deslogueado");
        $(".container").show();
        $(".login").show();
        $(".welcome").hide();
        $(".add__products").hide();
        $("#btnSign-out").hide();
      }
    });
  } else {
    console.log("despues de registrarse");
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
    console.log(uid + " desde add");

    let product = $("#task").val();

    $("#task").val("");
    console.log("El producto sera agregado en el id " + uid);
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
         <input  class="product__added" type="text" placeholder="${productAdded}" readonly  >
         <img class="edit" src="./images/editarr.png" alt="editar"> 
         <div id="delete"class="delete">x</div>
 </li>`);
      $(".product-list").append(markup);
      editProduct(markup, idProduct, uid);

      markup.find(".delete").on("click", (e) => {
        markup.find(".delete").off("click");
        e.preventDefault();
        $(".product-list").empty();
        console.log(productAdded);
        console.log("eliminar");
        deleteProduct(productAdded, idProduct, uid);
      });
    });
  });
}

//////////////delete product//////////////////////////////////////////
function deleteProduct(productAdded, idProduct, uid) {
  console.log(productAdded + ": id " + idProduct + "del usuaario " + uid);

  deleteDoc(doc(db, "products-" + uid, idProduct));
}
//////////////////////edit prouct////////////////////
function editProduct(markup, idProduct, uid) {
  markup.find("img").on("click", (e) => {
    markup.find(".product__added").prop("readonly", false);
    markup.find(".product__added").css("background-color", "white");
    markup.find(".product__added").prop("placeholder", "");
    markup.find(".product__added").on("keypress", async (e) => {
      if (e.keyCode === 13) {
      
        console.log("enter");
        let newProduct = markup.find(".product__added").val();
        markup.find(".product__added").prop("readonly", true);
        markup.find(".product__added").css("background-color", "#d4d2d4");
        /*       const docu = await getDoc(doc(db, "products-" + uid, idProduct)); */
        editStatus = true;
        console.log(newProduct);
        console.log(idProduct);
        updateDoc(doc(db, "products-" + uid, idProduct), {
          product: newProduct,
        });
      }
    });
  });
}

/////////////////////////mostraar mensaje exitoso o de error segun corresponda/////////////////////////////
function showMessage(message) {
  const markup = `<div class="message">${message}</div>`;
  $(".login").append(markup); //MOSTRAR EL ERROR EN PANTALLA
  $(".message").hide(5000); //MOSTRAR POR 3 SEGUNDOS EL MENSAJE DE ERROR
}
