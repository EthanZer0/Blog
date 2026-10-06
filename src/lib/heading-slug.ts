export function slugify(str: string) {
  return (
    str
      .replaceAll(/[ÀÁÂÃÄÅæ]/gi, 'a')
      .replaceAll(/ç/gi, 'c')
      .replaceAll(/ð/gi, 'd')
      .replaceAll(/[ÈÉÊË]/gi, 'e')
      .replaceAll(/[ÏÎÍÌ]/gi, 'i')
      .replaceAll(/Ñ/gi, 'n')
      .replaceAll(/[øœÕÔÓÒ]/gi, 'o')
      .replaceAll(/[ÜÛÚÙ]/gi, 'u')
      .replaceAll(/[ŸÝ]/gi, 'y')
      // remove non-chinese, non-latin, non-number, non-space
      .replaceAll(
        /[^\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AFa-z0-9- ]/gi,
        '',
      )
      .replaceAll(' ', '-')
      .toLowerCase()
  )
}
