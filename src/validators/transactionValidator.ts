import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().required(),
    category: Joi.string().required(),
    value: Joi.number().required(),
    type: Joi.string().allow('income', 'outcome').required(),
  }),
});
