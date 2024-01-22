
import mongoose from "mongoose";

interface IPlainDate {
  date: string
}

export const plainDateSchema = new mongoose.Schema<IPlainDate>({
  date: String
});

export const PlainDate = mongoose.model<IPlainDate>('PlainDate', plainDateSchema);

interface INormalDate {
  date: Date
}

export const normalDateSchema = new mongoose.Schema<INormalDate>({
  date: Date
});

export const NormalDate = mongoose.model<INormalDate>('NormalDate', normalDateSchema);
