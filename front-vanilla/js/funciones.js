const contenedorColores = document.querySelector("ul");
const formulario = document.querySelector("form");
const inputText = document.querySelector('form input[type="text"]');
const parrafoError = document.querySelector(".error");
const modalBorrar = document.querySelector(".modal-borrar");
const botonesModalBorrar = document.querySelectorAll(".modal-borrar button");
let colorBorrar = null;//esto va a guardar una referencia global al color que pensamos borrar
const modalEditar = document.querySelector(".modal-editar");
const botonesModalEditar = document.querySelectorAll(".modal-editar button");
let colorEditar = null;
let valoresRGBEditar = [0,0,0];//variable para guardar el ESTADO previo a editar
const previewEditar = document.querySelector(".color");
const controlesEditar = document.querySelectorAll(".modal-editar input");

//carga inicial de los datos 
fetch("/colores")
.then( respuesta => respuesta.json())
.then( colores => {
    colores.forEach(({_id,r,g,b}) => {
        new Color(_id,r,g,b,contenedorColores);
    });
});

formulario.addEventListener("submit", evento => {
    evento.preventDefault();

    parrafoError.classList.remove("visible");

    if(/^([0-9]{1,3},){2}[0-9]{1,3}$/.test(inputText.value)){
        let valores = inputText.value.split(",").map( n => Number(n) );

        let valido = true;

        let i = 0;

        while(valido && i < 3){
            valido = valores[i] <= 255;
            i++;
        }

        if(valido){
            let [r,g,b] = valores;

            return fetch("/colores/nuevo",{
                        method : "POST",
                        body : JSON.stringify({r,g,b}),
                        headers : {
                            "Content-type" : "application/json"
                        }
                    })
                    .then( respuesta => {
                        if(respuesta.status == 201){
                            return respuesta.json();
                        }
                        throw "Error al crear color";
                    } )
                    .then(({_id}) => {
                        new Color(_id,r,g,b,contenedorColores);
                        inputText.value = "";
                    })
                    .catch( e => {
                        //informar al usuario del error en la UI
                        console.log(e);
                    });

        }

    }

    parrafoError.classList.add("visible");

});

//gestión de borrar
botonesModalBorrar.forEach( (boton,i) => {
    boton.addEventListener("click", () => {
        if(i == 0){
            colorBorrar = null;
            return modalBorrar.classList.remove("modal-visible");
        }
        colorBorrar.borrarColor();
    });
});

//gestión editar
botonesModalEditar.forEach( (boton,i) => {
    boton.addEventListener("click", () => {
        if(i == 0){
            valoresRGBEditar.forEach((valor,i) => {//restaurar los valores RGB originales del objeto
                colorEditar.rgb[i] = valor;
                valoresRGBEditar[i] = 0;
            });
            colorEditar = null;
            return modalEditar.classList.remove("modal-visible");
        }
        colorEditar.actualizarColor();  
    });
});

controlesEditar.forEach( (control,i) => {
    control.addEventListener("input", () => {
        colorEditar.rgb[i] = Number(control.value);
        previewEditar.style.backgroundColor = `rgb(${colorEditar.rgb.join(",")})`;
    });
});