

const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {

    // Bloco de validação dos inputs

    let erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }

    if (!req.body.email || typeof req.body.email == undefined || req.body.email == null) {
        erros.push({ texto: "Email inválido" })
    }

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        erros.push({ texto: "Senha inválida" })
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome muito curto!" })
    }

    if (!req.body.email || req.body.email.indexOf("@") < 1 || req.body.email.indexOf('.') < 7) {
        erros.push({ texto: "Digite um email valido!" })
    }


    if (req.body.senha.length < 6) {
        erros.push({ texto: "Digite uma senha com no minimo 6 digitos!" })
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({ texto: "As senha são diferentes, tente novamente!" })
    }

    if (erros.length > 0) {

        res.render('usuarios/registro', { erros: erros })

    } else {

        // Aqui neste bloco verificamos se o email digitado já esta cadastrado no db.

        Usuario.findOne({ email: req.body.email }).then((usuario) => {
            if (usuario) {
                req.flash('error_msg', "Já existe uma conta registrada com esse email!")
                res.redirect('/usuarios/registro')
            } else {
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                    //Para cadastrar um usuario com permição de admin, descomente a linha abaixo...
                    //userAdmin: 1
                })

                // Nesta parte colocamos (hash) na nossa senha

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', "houve um erro durante o salvamento do usuário")
                            res.redirect("/")
                        }

                        novoUsuario.senha = hash

                        novoUsuario.save().then(() => {

                            req.flash('success_msg', "Usuario criado com sucesso!")
                            res.redirect('/')

                        }).catch((err) => {

                            req.flash('error_msg', "houve um erro ao criar o usuário, tente novamente!")
                            res.redirect('/usuarios/registro')
                        })
                    })
                })
            }

        }).catch((err) => {
            req.flash('error_msg', "Houve um erro interno")
            res.redirect('/')
        })

    }
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req,res, next) =>{

    //Com este bloco autenticamos o nosso usuário...
    
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)

})

router.get('/logout', (req, res) => {

    req.logout()
    req.flash('success_msg', "Deslogado com sucesso!")
    res.redirect('/')
})


module.exports = router