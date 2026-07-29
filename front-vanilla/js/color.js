class Color{
    constructor(id,r,g,b,contenedor){
        this.id = id;
        this.rgb = [r,g,b];
        this.DOM = null;
        this.crearColor(contenedor);
    }
    crearColor(contenedor){
        this.DOM = document.createElement("li");

        this.DOM.style.backgroundColor = `rgb(${this.rgb.join(",")})`;

        this.DOM.innerHTML = `<span>${this.rgb.join(",")}</span>
                              <button>editar</button> 
                              <button>borrar</button>`;

        let botonEditar = this.DOM.querySelector("button:nth-child(2)");

        botonEditar.addEventListener("click", () => {
            colorEditar = this;
            previewEditar.style.backgroundColor = `rgb(${this.rgb.join(",")})`;
            controlesEditar.forEach( (control,i) => {
                valoresRGBEditar[i] = this.rgb[i];
                control.value = this.rgb[i];
            });
            modalEditar.classList.add("modal-visible");
        });                      
        
        let botonBorrar = this.DOM.querySelector("button:nth-child(3)");

        botonBorrar.addEventListener("click", () => {
            colorBorrar = this;
            modalBorrar.classList.add("modal-visible");
        });

        
        contenedor.appendChild(this.DOM);                      
    }
    actualizarColor(){
        let [r,g,b] = this.rgb;
        fetch(`/colores/actualizar/${this.id}`,{
            method: "PATCH",
            body : JSON.stringify({r,g,b}),
            headers : {
                "Content-type" : "application/json"
            }
        })
        .then( respuesta => {
            if(respuesta.status == 204){
                this.DOM.children[0].innerText = this.rgb.join(",");
                this.DOM.style.backgroundColor = `rgb(${this.rgb.join(",")})`;
                valoresRGBEditar = [0,0,0];
                return modalEditar.classList.remove("modal-visible");
            }
            throw "Error actualizando el color";
        })
        .catch( e => {
            console.log("informar al usuario del error");
        });
    }
    borrarColor(){
        fetch(`/colores/borrar/${this.id}`,{
            method: "DELETE"
        })
        .then( respuesta => {
            if(respuesta.status == 204){
                this.DOM.remove();
                return modalBorrar.classList.remove("modal-visible");
            }
            throw "Error borrando el color";
        })
        .catch( e => {
            console.log("informar al usuario del error");
        });
    }
}