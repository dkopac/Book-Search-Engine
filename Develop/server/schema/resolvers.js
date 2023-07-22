const { AuthenticationError } = require('apollo-server-express');
const User  = require('../models');
const { remove } = require('../models/Book');
const { signToken } = ('../utils/auth')

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                const user=await User.findOne({
                    _id: context.user._id
                })
                return user
            }
            throw new AuthenticationError('Not Logged In!')
        }
    },
    Mutation: {
        login: async (parent, {email, password}, context) => {
                const user=await User.findOne({
                    email: email
                })

                if (!user){
                    throw new AuthenticationError('No User Found with That ID!')
                }
                const isCorrectPassword = user.isCorrectPassword(password)
                if (!isCorrectPassword){
                    throw new AuthenticationError('Bad Credentials')
                }
                const token = signToken(user)
                return {token, user}

        },
        addUser: async (parent,args, context) => {
            const user = User.create(args)
            const token = signToken(user)
                return {token, user}
        },
        saveBook: async (parent, {bookData}, context) => {
            if (context.user) {
                const user=await User.findByIdAndUpdate(
                    {_id: context.user._id},
                    {$push:{savedBooks:bookData}},
                    {new:true}
                    )
                return user
            }
            throw new AuthenticationError('Book Not Saved!')
        },
        removeBook: async (parent, {bookId}, context) => {
                if (context.user) {
                    const user=await User.findByIdAndUpdate(
                        {_id: context.user._id},
                        {$pull:{savedBooks:{bookId:bookId}}},
                        {new:true}
                        )
                    return user
                }
            throw new AuthenticationError('Book Not Removed!')
    },
}
}

module.exports = resolvers