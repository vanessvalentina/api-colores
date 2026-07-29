import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { leerColores,crearColor,actualizarColor,borrarColor,buscarUsuario } from "./db.js";

function autorizar(peticion,respuesta,siguiente){
       if(peticion.headers.authorization){
        let posibleToken = peticion.headers.authorization.split("Bearer ");

        if(posibleToken.length == 2 && posibleToken[0] == ""){
                return jwt.verify(posibleToken[1],process.env.SECRET, (error, datos) => {
                        console.log(error);
                        if(!error){
                          peticion.usuario = datos.usuario;
                          return siguiente();
                        }
                        respuesta.sendStatus(401);
                });
        }

       }
       respuesta.sendStatus(401);
}

const servidor = express();

servidor.use(express.json());

servidor.post("/login", async (peticion,respuesta) => {
    let {usuario,password} = peticion.body;

    if(!usuario || usuario.trim() == "" || !password || password.trim() == ""){
        return siguiente(true);
    }

    try{
        let usuarioBBDD = await buscarUsuario(usuario);

        if(!usuarioBBDD){
            return siguiente();
        }

        let valido = await bcrypt.compare(password,usuarioBBDD.password);

        if(!valido){
            return respuesta.sendStatus(403);
        }

        let token = jwt.sign({ usuario : usuarioBBDD._id },process.env.SECRET);

        respuesta.json({ token });

    }catch(e){
        respuesta.sendStatus(500);
    }
});

servidor.use(autorizar);

servidor.get("/colores", async (peticion,respuesta) => {
        try{
                let colores = await leerColores(peticion.usuario);

                respuesta.json(colores);
        }catch(e){
                respuesta.sendStatus(500);
        }
});

servidor.post("/colores/nuevo", async (peticion,respuesta,siguiente) => {
       let {r,g,b} = peticion.body;

       let valido = true;

       [r,g,b].forEach( n => {
                valido = valido && n != undefined && /^[0-9]{1,3}$/.test(n) && Number(n) <= 255;
       });

       if(!valido){
          return siguiente(true); 
       }

       let {usuario} = peticion;

       try{
           let _id = await crearColor(
                {
                        r : Number(r),
                        g : Number(g),
                        b : Number(b),
                        usuario
                });
           
           respuesta.status(201);     
           respuesta.json({_id});
       }catch(e){
           respuesta.sendStatus(500);          
       }
});

servidor.patch("/colores/actualizar/:id", async (peticion,respuesta,siguiente) => {
        
        if(!/^[a-f0-9]{24}$/.test(peticion.params.id)){
                return siguiente();
        }

        let {r,g,b} = peticion.body;

       let valido = r != undefined || g != undefined || b != undefined;


        let objCambios = {};
        let claves = ["r","g","b"];
       
        [r,g,b].forEach( (n,i) => {
                if(n != undefined){
                        valido = valido && /^[0-9]{1,3}$/.test(n) && Number(n) <= 255;
                        
                        if(valido){
                                objCambios[claves[i]] = Number(n);
                        }
                }
       });

       if(!valido){
          return siguiente(true); 
       }

        try{

            let {modifiedCount,matchedCount} = await actualizarColor(peticion.params.id,objCambios);

            if(matchedCount){
                return respuesta.sendStatus(204);
            }

           siguiente();

        }catch(e){
            respuesta.sendStatus(500);     
        }

});

servidor.delete("/colores/borrar/:id", async (peticion,respuesta,siguiente) => {

        if(!/^[a-f0-9]{24}$/.test(peticion.params.id)){
                return siguiente();
        }

        try{
           let cantidad = await borrarColor(peticion.params.id);

           if(cantidad){
                return respuesta.sendStatus(204);
           }

           siguiente();
       }catch(e){
           respuesta.sendStatus(500);          
       }
});

servidor.use((error,peticion,respuesta,siguiente) => {
        respuesta.sendStatus(400);
});

servidor.use((peticion,respuesta) => {
        respuesta.sendStatus(404);
});

servidor.listen(process.env.PORT);