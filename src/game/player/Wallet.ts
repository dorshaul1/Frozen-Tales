// Money remains separate from cargo and persistence.
export class Wallet {
  constructor(private money = 0) {}
  get balance() { return this.money; }
  credit(amount: number) { this.money += amount; }
  spend(amount: number): boolean {
    if (amount < 0 || this.money < amount) return false;
    this.money -= amount;
    return true;
  }
}
