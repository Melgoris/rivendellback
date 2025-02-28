import {body} from 'express-validator'

export const registerValidation = [
  body('player', 'Укажите ваш ник').isLength({min: 3}),
  body('password', 'Пароль минимум 5 символов ').isLength({min: 5}),
  body('avatar', 'не верная ссылка').optional().isURL(),
]

export const loginValidation = [
  body('player', 'Укажите ваш ник').isLength({min: 3}),
  body('password', 'Пароль минимум 5 символов ').isLength({min: 5}),
]
