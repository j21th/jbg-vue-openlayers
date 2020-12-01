function dateToYYYYMMDD(d) {
  const date = new Date(d)
  return `${date.getFullYear()}-${(1 + date.getMonth()).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}
export {
  dateToYYYYMMDD
}
