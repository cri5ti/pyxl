using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PyxlServer.Controllers
{


  public class PyxlHub : Hub<IClient>
  {
    private readonly MapRepository mapRepository;

    public PyxlHub(MapRepository mapRepository)
    {
      this.mapRepository = mapRepository;
    }

    public async Task JoinChannel(string name)
    {
      Channel = name;
      await Groups.AddToGroupAsync(Context.ConnectionId, name);
      mapRepository.EnsureMap(name);
    }

    private string Channel
    {
      get { return Context.Items["ChannelName"].ToString(); }
      set { Context.Items["ChannelName"] = value;  }
    }

    public async Task<Map> GetMap()
    {
      return mapRepository[Channel];
    }

    public async Task SetPixel(int x, int y, long color)
    {
      mapRepository[Channel].SetPixel(x, y, color);
      await Clients.OthersInGroup(Channel).PutPixel(x, y, color);
    }

  }


  public interface IClient
  {
    Task PutPixel(int x, int y, long color);
  }


  public class MapInfo
  {
    public int Width { get; set; }
    public int Height { get; set; }
  }



  public class MapRepository
  {
    Dictionary<string, Map> maps = new Dictionary<string, Map>();

    internal void EnsureMap(string name)
    {
      if (!maps.ContainsKey(name))
        maps.Add(name, new Map(32, 32));
    }

    public Map this[string name]
    {
      get { return maps.GetValueOrDefault(name); }
    }
  }

  public struct Map
  {
    int width;
    int height;
    long[] map;

    public int Width => width;
    public int Height => height;
    public long[] Data => map;

    public Map(int w, int h)
    {
      width = w;
      height = h;
      map = new long[w * h];
    }

    internal void SetPixel(int x, int y, long color)
    {
      if (x < 0) x = 0;
      if (x >= width) x = width - 1;
      if (y < 0) y = 0;
      if (y >= height) y = height - 1;
      map[y * width + x] = color;
    }
  }


}
