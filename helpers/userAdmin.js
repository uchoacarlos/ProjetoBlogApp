module.exports = {
    userAdmin: function(req, res, next){
        if(req.isAuthenticated() && req.user.userAdmin == 1){
            return next();
        }

        req.flash('error_msg', "Você precisa ser um admin!")
        res.redirect('/')

    }
}