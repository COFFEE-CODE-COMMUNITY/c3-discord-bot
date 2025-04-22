class AutoCache<K, V extends object> {
  private map: Map<K, WeakRef<V>> = new Map<K, WeakRef<V>>()
  private registry = new FinalizationRegistry<K>(key => {
    this.map.delete(key)
  })

  public set(key: K, value: V): void {
    const ref = new WeakRef<V>(value);

    this.map.set(key, ref);
    this.registry.register(value, key);
  }

  public get(key: K): V | undefined {
    const ref = this.map.get(key)

    return ref?.deref()
  }

  public has(key: K): boolean {
    const ref = this.map.get(key);
    return !!ref?.deref();
  }

  public delete(key: K): void {
    const ref = this.map.get(key);

    if (ref) {
      const value = ref?.deref()

      if (value) {
        this.registry.unregister(value)

        this.map.delete(key)
      }
    }
  }

  public clear(): void {
    this.map.clear();
  }
}