export function generateRandomBetArray(numberOfBets: number) {
  type RandomBetType = {
    game: string
    numbers: string
  }
  const gamesArray = [
    { type: 'Lotofácil', range: 25, min_and_max_number: 15 },
    { type: 'Mega-Sena', range: 60, min_and_max_number: 6 },
    { type: 'Quina', range: 80, min_and_max_number: 5 },
  ]
  const randomNumbersSet: Set<number> = new Set()
  let gameIndex: number
  let randomNumber: number
  let randomBet: RandomBetType = { game: '', numbers: '' }
  const randomBetArray: RandomBetType[] = []

  for (let counter = 0; counter < numberOfBets; counter++) {
    gameIndex = Math.round(Math.random() * (gamesArray.length - 1))
    while (randomNumbersSet.size < gamesArray[gameIndex].min_and_max_number) {
      randomNumber = Math.ceil(Math.random() * gamesArray[gameIndex].range)
      randomNumbersSet.add(randomNumber)
    }
    randomBet = {
      game: gamesArray[gameIndex].type,
      numbers: [...randomNumbersSet].sort((a, b) => a - b).join(','),
    }
    randomBetArray.push(randomBet)
    randomNumbersSet.clear()
  }
  return randomBetArray
}
