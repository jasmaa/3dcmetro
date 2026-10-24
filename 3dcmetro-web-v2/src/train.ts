import * as z from "zod";

const TrainLocationData = z.object({
  features: z.array(z.object({
    attributes: z.object(),
    geometry: z.object({
      x: z.number(),
      y: z.number(),
    })
  })),
});

type TrainLocationData = z.infer<typeof TrainLocationData>;

export async function getTrainLocationData(): Promise<TrainLocationData> {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error("No API URL is set");
  }

  const trainLocationsUrl = new URL("/trainlocations", apiUrl);
  const res = await fetch(trainLocationsUrl);
  if (!res.ok) {
    throw new Error(`API call failed: status=${res.status}`);
  }

  const text = await res.text();
  const rawTrainLocationData = JSON.parse(text);
  return TrainLocationData.parse(rawTrainLocationData);
}