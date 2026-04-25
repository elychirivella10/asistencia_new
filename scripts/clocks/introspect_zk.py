from zk import ZK
import inspect

def list_methods():
    print("Methods available in ZK class:")
    for name, member in inspect.getmembers(ZK):
        if inspect.isfunction(member) or inspect.ismethod(member):
            print(f"- {name}")

if __name__ == "__main__":
    list_methods()
