export const NODE_ENV: string = process.env.NODE_ENV

const NODE_ENV_LOWER: string = NODE_ENV?.toLowerCase()
export const IS_DEV_ENV: boolean = !NODE_ENV_LOWER || NODE_ENV_LOWER === 'dev' || NODE_ENV_LOWER === 'development'
