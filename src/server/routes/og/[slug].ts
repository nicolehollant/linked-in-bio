import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { Resvg, ResvgRenderOptions } from '@resvg/resvg-js'
import satori from 'satori'

export default defineEventHandler(async (event) => {
  const client = event.context.prisma
  const slug = event.context.params.slug
  const fonts = ['arial.ttf', 'arial_bold.ttf']
  console.log(process.cwd())

  try {
    const user = await client.user.findFirst({
      where: {
        OR: [{ username: slug }, { email: slug }],
      },
      select: {
        avatar: true,
        username: true,
        name: true,
        bio: true,
        image: true,
      },
    })
    if (!user) throw Error('No user found')

    let figureChild: any = {
      type: 'div',
      props: {
        children: ['linkedinb.io'],
      },
    }
    if (user.avatar) {
      figureChild = {
        type: 'img',
        props: {
          style: {
            width: '100%',
            height: '100%',
            borderRadius: '100%',
          },
          src: user.avatar,
          alt: '',
        },
      }
    } else if (user.username?.charAt?.(0)) {
      figureChild = {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            borderRadius: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: '600',
          },
          children: [user.username.charAt(0)],
        },
      }
    }
    const figure = {
      type: 'figure',
      props: {
        style: {
          borderRadius: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: '8rem',
          width: '8rem',
          background: '#262626',
        },
        children: [figureChild],
      },
    }
    const title = {
      type: 'p',
      props: {
        style: {
          margin: '0',
          fontSize: '28px',
          fontWeight: '700',
        },
        children: [user.name ?? user.username],
      },
    }
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            gap: '24px',
            background: '#171717',
            color: '#ffffff',
          },
          children: [
            figure,
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                },
                children: [
                  title,
                  {
                    type: 'p',
                    props: {
                      style: {
                        marginTop: '8px',
                        fontSize: '18px',
                        color: '#a3a3a3',
                      },
                      children: [
                        `linkedinb.io/`,
                        {
                          type: 'span',
                          props: {
                            style: {
                              color: '#ffffff',
                            },
                            children: user.username,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        width: 500,
        height: 300,
        fonts: [
          {
            name: 'Arial',
            data: readFileSync(
              process.dev ? join(process.cwd(), 'src/public/fonts', fonts[0]) : join('fonts', fonts[0])
            ),
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Arial',
            data: readFileSync(
              process.dev ? join(process.cwd(), 'src/public/fonts', fonts[1]) : join('fonts', fonts[1])
            ),
            weight: 700,
            style: 'normal',
          },
        ],
      }
    )

    // render to svg as image

    const resvg = new Resvg(svg, {
      fitTo: {
        mode: 'width',
        value: 500,
      },
      font: {
        fontFiles: fonts.map((i) => join(resolve('.'), process.dev ? 'src/public/fonts' : 'fonts', i)), // Load custom fonts.
        loadSystemFonts: false,
      },
    })

    const resolved = await Promise.all(
      resvg.imagesToResolve().map(async (url) => {
        console.info('image url', url)
        const img = await fetch(url)
        const buffer = await img.arrayBuffer()
        return {
          url,
          buffer: Buffer.from(buffer),
        }
      })
    )
    if (resolved.length > 0) {
      for (const result of resolved) {
        const { url, buffer } = result
        resvg.resolveImage(url, buffer)
      }
    }

    const renderData = resvg.render()
    const pngBuffer = renderData.asPng()

    event.res.setHeader('Cache-Control', 's-maxage=7200, stale-while-revalidate')
    return pngBuffer
  } catch (err) {
    return createError({ statusCode: 500, statusMessage: err + '' })
  }
})
