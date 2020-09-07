import faker from 'faker';
import factory from 'factory-girl';

factory.define(
  'Transaction',
  {},
  {
    title: faker.name.title,
    type: () => faker.random.arrayElement(['income', 'outcome']),
    value: faker.random.number,
    category: faker.finance.transactionType,
  },
);

export default factory;
