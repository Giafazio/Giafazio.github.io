import type {
  CreationDate,
  PublishableEntry,
} from "./types";

function creationDateSortKey(
  date: CreationDate,
): string {
  switch (date.precision) {
    case "day":
      return date.value;

    case "month":
      return `${date.value}-00`;

    case "year":
    case "approximate-year":
      return `${date.value}-00-00`;
  }
}

export function compareCreationDate(
  firstEntry: PublishableEntry,
  secondEntry: PublishableEntry,
): number {
  const dateDifference =
    creationDateSortKey(
      secondEntry.data.creationDate,
    ).localeCompare(
      creationDateSortKey(
        firstEntry.data.creationDate,
      ),
    );

  if (dateDifference !== 0) {
    return dateDifference;
  }

  const firstTitle =
    firstEntry.data.title ??
    firstEntry.data.workingLabel ??
    firstEntry.data.id;

  const secondTitle =
    secondEntry.data.title ??
    secondEntry.data.workingLabel ??
    secondEntry.data.id;

  return firstTitle.localeCompare(
    secondTitle,
  );
}

export function formatCreationDate(
  date: CreationDate,
  locale = "en-GB",
): string {
  if (date.precision === "year") {
    return date.value;
  }

  if (
    date.precision ===
    "approximate-year"
  ) {
    return `c. ${date.value}`;
  }

  const [
    year,
    month = "01",
    day = "01",
  ] = date.value.split("-");

  const instant = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
    ),
  );

  const options:
    Intl.DateTimeFormatOptions =
    date.precision === "day"
      ? {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        }
      : {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        };

  return new Intl.DateTimeFormat(
    locale,
    options,
  ).format(instant);
}