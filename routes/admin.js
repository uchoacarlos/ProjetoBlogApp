const express = require("express")
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {userAdmin} = require('../helpers/userAdmin')


router.get('/', userAdmin, (req, res) => {
    res.render("admin/index")
})

router.get('/posts', userAdmin, (req, res) => {
    res.send("Pagina de posts")
})

router.get('/categorias', userAdmin, (req, res) => {
    Categoria.find().sort({ date: 'desc' }).then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "houve um erro ao listar categorias")
        res.redirect('/admin')
    })
})

router.get('/categorias/add', userAdmin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', userAdmin, (req, res) => {

    // Aqui neste bloco criamos a validação do formulario de novas categorias
    let erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria muito pequeno" })
    }
    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {

        // Aqui nesta parte inserimos um novo registro na collection do BD...
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            //console.log("Categoria salva com sucesso!")
            req.flash('success_msg', "Categoria criada com sucesso!")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash('error_msg', "Erro ao tentar criar a categoria!")
            res.redirect('/admin')
            //console.log("Erro ao salvar categoria!")
        })
    }

})


router.get("/categorias/edit/:id", userAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render("admin/editcategoria", { categoria: categoria })
    }).catch((err) => {
        req.flash('error_msg', "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })

})

router.post('/categorias/edit', userAdmin, (req, res) => {

    // Aqui neste bloco criamos a validação do formulario de edição
    let erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria muito pequeno" })
    }
    if (erros.length > 0) {
        res.render("admin/editcategoria", { erros: erros })
    } else {

        // Aqui nesta parte editamos um registro já exixtente na collection do BD...

        Categoria.findOne({ _id: req.body.id }).then((categoria) => {

            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash('success_msg', "Categoria editada com sucesso!")
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', "Houve um erro interno ao tentar editar a categoria")
                res.redirect('/admin/categorias')
            })

        }).catch((err) => {
            req.flash('error_msg', "Houve um erro ao editar a categoria")
            res.redirect('/admin/categorias')
        })
    }
})

router.post('/categorias/deletar', userAdmin, (req, res) => {
    Categoria.remove({ _id: req.body.id }).then(() => {
        req.flash('success_msg', "Categoria deletada com sucesso!")
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', "Erro ao tentar deletar categoria!")
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', userAdmin, (req, res) => {
    Postagem.find().populate('categoria').sort({ data: "desc" }).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens })
    }).catch((err) => {
        req.flash('error_msg', "Houve um erro ao carregar postagens")
        res.redirect('/admin')
    })

})
// Neste bloco deletamos a categoria atraves do uso de um form
router.get('/postagens/add', userAdmin, (req, res) => {
    // Aqui chamamos as categorias salvas...
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagens', { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', "houve um erro ao carregar o formulário")
        res.redirect('/admin')
    })

})

router.post('/postagens/nova', userAdmin, (req, res) => {

    let erros = [];

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: "Titulo invalido" })
    }
    if (req.body.titulo.length < 2) {
        erros.push({ texto: "Titulo muito pequeno" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({ texto: "Descrição invalida" })
    }
    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: "Conteudo invalido" })
    }
    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida,  registre uma categoria" })
    }
    if (erros.length > 0) {
        Categoria.find().then((categorias) => {
            res.render("admin/addpostagens", { erros: erros, categorias: categorias })
        })

    } else {

        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', "Postagem criada com sucesso!")
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', "Erro ao tentar cadastrar nova postagem!")
            res.redirect('admin')
        })
    }

})

router.get('/postagens/edit/:id', userAdmin, (req, res) => {
    //Aqui nesta parte estamos fazendo duas buscas no mongo em seguida para apresentalos no formulario de edição

    Postagem.findOne({ _id: req.params.id }).then((postagem) => {

        Categoria.find().then((categorias) => {
            res.render('admin/editpostagem', { categorias: categorias, postagem: postagem })
        }).catch((err) => {

            req.flash('error_msg', "Houve um erro ao carregar as categorias")
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {

        req.flash('error_msg', "Houve um erro ao carregar o formulário de edição")
        res.redirect('/admin/postagens')
    })
})

router.post('/postagens/edit', userAdmin, (req, res) => {

    let erros = [];

    if (!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null) {
        erros.push({ texto: "Titulo invalido" })
    }
    if (req.body.titulo.length < 2) {
        erros.push({ texto: "Titulo muito pequeno" })
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug invalido" })
    }
    if (!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null) {
        erros.push({ texto: "Descrição invalida" })
    }
    if (!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null) {
        erros.push({ texto: "Conteudo invalido" })
    }
    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria invalida,  registre uma categoria" })
    }
    if (erros.length > 0) {
        Categoria.find().then((categorias) => {
            res.render("admin/editpostagens", { erros: erros, categorias: categorias })
        })

    } else {

        Postagem.findOne({ _id: req.body.id }).then((postagem) => {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash('success_msg', "Postagem editada com sucesso!")
                res.redirect('/admin/postagens')
            }).catch((err) => {
                req.flash('error_msg', "Houve um erro interno")
                res.redirect('/admin/postagens')
            })

        }).catch((err) => {
            console.log(err)
            req.flash('error_msg', "Houve um erro ao salvar a edição!")
            res.redirect('/admin/postagens')
        })

    }
})
//Neste bloco deletamos a postagem de uma maneira diferente do "deletar categoria" sem um uso de um form
router.get('/postagens/delete/:id', userAdmin, (req, res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        req.flash('success_msg', "Postagem deletada com sucesso!")
        res.redirect('/admin/postagens')
    }).catch((err) => {
        res.flash('error_msg', "Erro ao tentar deletar postagem")
    })
})


module.exports = router;