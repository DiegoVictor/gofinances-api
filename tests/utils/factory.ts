import { faker } from '@faker-js/faker';
import factory from 'factory-girl';

factory.define(
  'Transaction',
  {},
  {
    title: faker.lorem.words,
    type: () => faker.helpers.arrayElement(['income', 'outcome']),
    value: faker.datatype.number,
    category: faker.finance.transactionType,
  },
);

export default factory;
