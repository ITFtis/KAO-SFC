using SFC.Models.Hydra;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;
using System.Linq;

namespace SFC.Models
{
    public partial class DouModelContextExt : Dou.Models.ModelContextBase<User, Role>
    {
        public DouModelContextExt()
            : base("name=DouModelContextExt")
        {
            Database.SetInitializer<DouModelContextExt>(null);
        }

        //public DbSet<User> Users { get; set; }
        //public DbSet<Role> Roles { get; set; }
        public DbSet<GlobalCounty> GlobalCounties { get; set; }
        public DbSet<StationBase> StationBases { get; set; }
        public DbSet<DeviceBase> DeviceBases { get; set; }
        public DbSet<DeviceLora> DeviceLoras { get; set; }
        public DbSet<DeviceReliable> DeviceReliables { get; set; }

        /*設管科上傳API用*/
        public DbSet<HydraDeviceBase> HydraDeviceBase { get; set; }
        public DbSet<HydraDeviceRealTime> HydraDeviceRealTime { get; set; }
        public DbSet<HydraDeviceStatusRemark> HydraDeviceStatusRemark { get; set; }
        public DbSet<HydraStationBase> HydraStationBase { get; set; }
        public DbSet<HydraStationType> HydraStationType { get; set; }

        public DbSet<HydraDeviceType> HydraDeviceType { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
        }
    }
}
