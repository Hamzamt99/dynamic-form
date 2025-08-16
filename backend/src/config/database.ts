import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve(process.cwd(), 'data', 'app.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH,
  logging: false,
});

export class Workflow extends Model<
  InferAttributes<Workflow, { omit: 'created_at' | 'updated_at' }>,
  InferCreationAttributes<Workflow, { omit: 'id' | 'created_at' | 'updated_at' }>
> {
  declare id: CreationOptional<number>;
  declare workflow_id: string;
  declare json: string;

  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Workflow.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    workflow_id: { type: DataTypes.STRING, unique: true, allowNull: false },
    json: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    sequelize,
    tableName: 'workflows',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export async function ensureDB() {
  await sequelize.sync();
}
