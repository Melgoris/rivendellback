import {body} from 'express-validator'

export const cardValidation = [
  body('name').optional().isLength({min: 3}).isString(),
  body('realm').optional().isLength({min: 3}).isString(),
  body('region').optional().isString(),
  body('class').optional().isLength({min: 3}).isString(),
  body('faction').optional().isLength({min: 3}).isString(),
  body('gender').optional().isLength({min: 3}).isString(),
  body('last_crawled_at').optional().isString(),
  body('profile_banner').optional().isString(),
  body('profile_url').optional().isURL(),
  body('race').optional().isString(),
  body('thumbnail_url').optional().isString(),
  body('active_spec_name').optional().isString(),
  body('active_spec_role').optional().isString(),

  body('BD_NAME').optional().isString(),
  body('gear').optional().isObject(),
]
