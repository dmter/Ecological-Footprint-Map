import pandas as pd

df = pd.read_csv("eco.csv")
print("CSV file loaded successfully.")


grouped = df.groupby("name").agg({"pop": "sum", "co2_per_capita": "sum"}).reset_index()


result = grouped[["name", "pop", "co2_per_capita"]]

result.to_csv("eco_merge.csv", index=False)

print(result)
