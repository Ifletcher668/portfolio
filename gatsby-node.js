const {createRemoteFileNode} = require('gatsby-source-filesystem')
const {resolve} = require('path')
const path = require('path')
const {formatDateOnSlug} = require('./src/utils/formattedDates')

require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`,
})

exports.createPages = async ({actions, graphql, reporter}) => {
    const {createPage} = actions
    const {error, data} = await graphql(
        `
            query {
                strapi {
                    blogs {
                        id
                        slug
                        published
                    }
                    poems {
                        id
                        slug
                        published
                    }
                }
            }
        `,
    )

    if (error)
        return reporter.panicOnBuild(`Error while running GraphQL query!`)

    const blogs = data.strapi.blogs

    blogs.forEach(({slug, id, published}) => {
        createPage({
            path: `/writing/journal/${formatDateOnSlug(published)}/${slug}`,
            component: path.resolve(`./src/templates/blogPost.tsx`), // the template
            context: {
                id: id,
            },
        })
    })

    const poetry = data.strapi.poems

    poetry.forEach(({slug, id, published}) => {
        createPage({
            path: `/writing/poetry/${formatDateOnSlug(published)}/${slug}`,
            component: path.resolve(`./src/templates/poem.tsx`),
            context: {
                id: id,
            },
        })
    })
}

exports.createResolvers = async ({
    actions,
    cache,
    createNodeId,
    createResolvers,
    store,
    reporter,
}) => {
    const {createNode} = actions
    await createResolvers({
        STRAPI_UploadFile: {
            imageFile: {
                type: 'File',
                async resolve(source) {
                    return await createRemoteFileNode({
                        url: source.url,
                        store,
                        cache,
                        createNode,
                        createNodeId,
                        reporter,
                    })
                },
            },
        },
    })
}
